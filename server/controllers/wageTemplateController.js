const WageTemplate = require('../models/wageTemplateModel');

// Create a new wage template
exports.createWageTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user._id
    };

    const template = await WageTemplate.create(templateData);

    res.status(201).json({
      message: 'Wage template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating wage template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all wage templates
exports.getAllWageTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, wageType, wageCategory, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (wageType) query.wageType = wageType;
    if (wageCategory) query.wageCategory = wageCategory;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const templates = await WageTemplate.find(query)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WageTemplate.countDocuments(query);

    res.json({
      data: templates,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching wage templates:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get wage template by ID
exports.getWageTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await WageTemplate.findById(templateId)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!template) {
      return res.status(404).json({ message: 'Wage template not found' });
    }

    res.json({ data: template });
  } catch (error) {
    console.error('Error fetching wage template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update wage template
exports.updateWageTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const template = await WageTemplate.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name')
     .populate('updatedBy', 'name');

    if (!template) {
      return res.status(404).json({ message: 'Wage template not found' });
    }

    res.json({
      message: 'Wage template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Error updating wage template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete wage template
exports.deleteWageTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await WageTemplate.findByIdAndDelete(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Wage template not found' });
    }

    res.json({ message: 'Wage template deleted successfully' });
  } catch (error) {
    console.error('Error deleting wage template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get default templates by category
exports.getDefaultTemplates = async (req, res) => {
  try {
    const { wageType, wageCategory } = req.query;

    let query = { isActive: true, isDefault: true };
    if (wageType) query.wageType = wageType;
    if (wageCategory) query.wageCategory = wageCategory;

    const templates = await WageTemplate.find(query)
      .populate('createdBy', 'name')
      .sort({ wageType: 1, wageCategory: 1 });

    res.json({ data: templates });
  } catch (error) {
    console.error('Error fetching default templates:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Set default template
exports.setDefaultTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await WageTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Wage template not found' });
    }

    // Remove default flag from other templates of same type and category
    await WageTemplate.updateMany(
      { 
        wageType: template.wageType, 
        wageCategory: template.wageCategory, 
        _id: { $ne: templateId } 
      },
      { isDefault: false }
    );

    // Set this template as default
    template.isDefault = true;
    template.updatedBy = req.user._id;
    await template.save();

    res.json({
      message: 'Default template set successfully',
      data: template
    });
  } catch (error) {
    console.error('Error setting default template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Clone wage template
exports.cloneWageTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, description } = req.body;

    const originalTemplate = await WageTemplate.findById(templateId);
    if (!originalTemplate) {
      return res.status(404).json({ message: 'Wage template not found' });
    }

    const clonedData = {
      ...originalTemplate.toObject(),
      _id: undefined,
      name: name || `${originalTemplate.name} (Copy)`,
      description: description || originalTemplate.description,
      isDefault: false,
      createdBy: req.user._id,
      updatedBy: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };

    const clonedTemplate = await WageTemplate.create(clonedData);

    res.status(201).json({
      message: 'Wage template cloned successfully',
      data: clonedTemplate
    });
  } catch (error) {
    console.error('Error cloning wage template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get wage template statistics
exports.getWageTemplateStats = async (req, res) => {
  try {
    const stats = await WageTemplate.aggregate([
      {
        $group: {
          _id: {
            wageType: '$wageType',
            wageCategory: '$wageCategory'
          },
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          defaultCount: {
            $sum: { $cond: [{ $eq: ['$isDefault', true] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: '$count' },
          activeTemplates: { $sum: '$activeCount' },
          defaultTemplates: { $sum: '$defaultCount' },
          byType: {
            $push: {
              wageType: '$_id.wageType',
              wageCategory: '$_id.wageCategory',
              count: '$count',
              activeCount: '$activeCount',
              defaultCount: '$defaultCount'
            }
          }
        }
      }
    ]);

    res.json({
      data: stats.length > 0 ? stats[0] : {
        totalTemplates: 0,
        activeTemplates: 0,
        defaultTemplates: 0,
        byType: []
      }
    });
  } catch (error) {
    console.error('Error fetching wage template stats:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};




