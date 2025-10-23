const DeliveryTask = require('../models/deliveryTaskModel');
const DeliveryIntake = require('../models/deliveryIntakeModel');
const StaffLocation = require('../models/StaffLocation');
const BarrelMovement = require('../models/barrelMovementModel');
const Barrel = require('../models/barrelModel');

/**
 * Get Task History for Delivery Staff
 * Combines task data with barrel scan, location tracking, and barrel intake information
 */
exports.getTaskHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { filter = 'all' } = req.query;

    // Build date filter based on query
    let dateFilter = {};
    const now = new Date();
    
    switch (filter) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lte: new Date(now.setHours(23, 59, 59, 999))
          }
        };
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: monthStart } };
        break;
      default:
        // All tasks - no date filter
        break;
    }

    // Fetch all tasks assigned to this delivery staff
    const tasks = await DeliveryTask.find({
      assignedTo: userId,
      ...dateFilter
    })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich each task with additional data
    const enrichedHistory = await Promise.all(
      tasks.map(async (task) => {
        // 1. Get barrel scan data (from barrelMovement or task meta)
        let barrelScanData = null;
        if (task.meta && task.meta.barrelScan) {
          barrelScanData = task.meta.barrelScan;
        } else {
          // Try to find barrel movements associated with this task
          const movements = await BarrelMovement.find({
            createdBy: userId,
            createdAt: {
              $gte: new Date(task.createdAt),
              $lte: task.deliveredAt || new Date()
            }
          }).limit(5);

          if (movements.length > 0) {
            barrelScanData = {
              barrelCount: movements.length,
              scannedAt: movements[0].createdAt,
              location: movements[0].fromLocation || movements[0].toLocation
            };
          }
        }

        // 2. Get location tracking data
        const locationUpdates = [];
        if (task.meta && task.meta.locationTracking) {
          locationUpdates.push(...task.meta.locationTracking);
        } else {
          // Fetch location updates for this task timeframe
          const locations = await StaffLocation.find({
            user: userId,
            updatedAt: {
              $gte: new Date(task.createdAt),
              $lte: task.deliveredAt || new Date()
            }
          })
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();

          locations.forEach(loc => {
            locationUpdates.push({
              latitude: loc.coords.lat,
              longitude: loc.coords.lng,
              accuracy: loc.coords.accuracy,
              timestamp: loc.updatedAt
            });
          });
        }

        // 3. Get barrel intake data
        let barrelIntake = null;
        const intake = await DeliveryIntake.findOne({
          createdBy: userId,
          createdAt: {
            $gte: new Date(task.createdAt),
            $lte: task.deliveredAt || new Date(task.createdAt.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours
          }
        })
          .sort({ createdAt: -1 })
          .lean();

        if (intake) {
          barrelIntake = {
            _id: intake._id,
            name: intake.name,
            phone: intake.phone,
            barrelCount: intake.barrelCount,
            notes: intake.notes,
            status: intake.status,
            totalAmount: intake.totalAmount,
            createdAt: intake.createdAt,
            verifiedAt: intake.verifiedAt,
            approvedAt: intake.approvedAt
          };
        }

        // 4. Build enriched task object
        return {
          ...task,
          assignedAt: task.createdAt,
          pickupAt: task.status === 'picked_up' || task.status === 'enroute_drop' || task.status === 'delivered' 
            ? task.updatedAt 
            : null,
          deliveredAt: task.status === 'delivered' ? task.updatedAt : null,
          barrelScanData,
          locationUpdates,
          barrelIntake
        };
      })
    );

    res.json({
      success: true,
      history: enrichedHistory,
      count: enrichedHistory.length
    });

  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task history',
      error: error.message
    });
  }
};

/**
 * Get detailed history for a specific task
 */
exports.getTaskHistoryDetail = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await DeliveryTask.findOne({
      _id: taskId,
      assignedTo: userId
    }).lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get all related barrel movements
    const barrelMovements = await BarrelMovement.find({
      createdBy: userId,
      createdAt: {
        $gte: new Date(task.createdAt),
        $lte: task.deliveredAt || new Date()
      }
    })
      .populate('barrel', 'barrelId capacity currentVolume')
      .sort({ createdAt: 1 });

    // Get all location tracking
    const locationHistory = await StaffLocation.find({
      user: userId,
      updatedAt: {
        $gte: new Date(task.createdAt),
        $lte: task.deliveredAt || new Date()
      }
    }).sort({ updatedAt: 1 });

    // Get barrel intake
    const barrelIntake = await DeliveryIntake.findOne({
      createdBy: userId,
      createdAt: {
        $gte: new Date(task.createdAt),
        $lte: task.deliveredAt || new Date(task.createdAt.getTime() + 24 * 60 * 60 * 1000)
      }
    })
      .populate('verifiedBy approvedBy', 'name role')
      .lean();

    res.json({
      success: true,
      task,
      barrelMovements,
      locationHistory,
      barrelIntake,
      timeline: buildTimeline(task, barrelMovements, locationHistory, barrelIntake)
    });

  } catch (error) {
    console.error('Error fetching task detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task details',
      error: error.message
    });
  }
};

/**
 * Helper function to build a complete timeline
 */
function buildTimeline(task, barrelMovements, locationHistory, barrelIntake) {
  const events = [];

  // Task assigned
  events.push({
    type: 'task_assigned',
    timestamp: task.createdAt,
    description: `Task assigned: ${task.title}`,
    icon: 'user-check'
  });

  // Barrel scans
  barrelMovements.forEach(movement => {
    events.push({
      type: 'barrel_scan',
      timestamp: movement.createdAt,
      description: `Barrel scanned: ${movement.barrel?.barrelId || 'Unknown'}`,
      data: movement,
      icon: 'qrcode'
    });
  });

  // Location updates (show only key ones)
  if (locationHistory.length > 0) {
    events.push({
      type: 'location_start',
      timestamp: locationHistory[0].updatedAt,
      description: 'Started location tracking',
      icon: 'map-marker-alt'
    });

    if (locationHistory.length > 1) {
      events.push({
        type: 'location_update',
        timestamp: locationHistory[locationHistory.length - 1].updatedAt,
        description: `Location tracked (${locationHistory.length} updates)`,
        icon: 'route'
      });
    }
  }

  // Barrel intake
  if (barrelIntake) {
    events.push({
      type: 'barrel_intake',
      timestamp: barrelIntake.createdAt,
      description: `Barrel intake recorded: ${barrelIntake.barrelCount} barrels - ${barrelIntake.name}`,
      data: barrelIntake,
      icon: 'warehouse'
    });

    if (barrelIntake.verifiedAt) {
      events.push({
        type: 'intake_verified',
        timestamp: barrelIntake.verifiedAt,
        description: 'Barrel intake verified by manager',
        icon: 'check-circle'
      });
    }
  }

  // Task status changes
  if (task.status === 'picked_up' || task.status === 'enroute_drop' || task.status === 'delivered') {
    events.push({
      type: 'pickup_complete',
      timestamp: task.updatedAt,
      description: `Pickup completed from ${task.pickupAddress}`,
      icon: 'truck'
    });
  }

  if (task.status === 'delivered') {
    events.push({
      type: 'delivery_complete',
      timestamp: task.updatedAt,
      description: `Delivered to ${task.dropAddress}`,
      icon: 'check-double'
    });
  }

  // Sort by timestamp
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return events;
}

module.exports = {
  getTaskHistory: exports.getTaskHistory,
  getTaskHistoryDetail: exports.getTaskHistoryDetail
};
