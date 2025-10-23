import React, { useState, useEffect } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, ProgressIndicator, FloatingPrompt, Tooltip } from './RoleThemeProvider';

// Barrel Tracking Workflow Component
export const BarrelTrackingWorkflow = ({ barrelId, onComplete }) => {
    const { userRole, getRoleColor } = useRoleTheme();
    const [barrel, setBarrel] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [workflowData, setWorkflowData] = useState({
        weights: { empty: null, gross: null, lumb: null },
        damage: { type: null, severity: null, repairable: null },
        location: { current: null, previous: null },
        status: 'tracking'
    });
    const [showPrompt, setShowPrompt] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});

    const totalSteps = userRole === 'lab' ? 4 : userRole === 'field_staff' ? 3 : 2;

    useEffect(() => {
        // Fetch barrel data
        fetchBarrelData();
    }, [barrelId]);

    const fetchBarrelData = async () => {
        try {
            const response = await fetch(`/api/barrels/${barrelId}`);
            const data = await response.json();
            setBarrel(data);
        } catch (error) {
            console.error('Error fetching barrel data:', error);
        }
    };

    const validateWeights = (emptyWeight, grossWeight) => {
        const errors = {};
        
        if (!emptyWeight || emptyWeight <= 0) {
            errors.emptyWeight = 'Empty weight must be greater than 0';
        }
        
        if (!grossWeight || grossWeight <= 0) {
            errors.grossWeight = 'Gross weight must be greater than 0';
        }
        
        if (emptyWeight && grossWeight && grossWeight < emptyWeight) {
            errors.grossWeight = 'Gross weight must be greater than empty weight';
        }
        
        return errors;
    };

    const calculateLumbPercentage = (emptyWeight, grossWeight) => {
        if (!emptyWeight || !grossWeight || grossWeight <= emptyWeight) return 0;
        return ((grossWeight - emptyWeight) / grossWeight) * 100;
    };

    const handleWeightUpdate = (field, value) => {
        const newWeights = { ...workflowData.weights, [field]: parseFloat(value) };
        setWorkflowData(prev => ({ ...prev, weights: newWeights }));
        
        // Real-time validation
        if (field === 'emptyWeight' || field === 'grossWeight') {
            const errors = validateWeights(newWeights.empty, newWeights.gross);
            setValidationErrors(prev => ({ ...prev, ...errors }));
            
            // Auto-calculate lumb percentage
            if (newWeights.empty && newWeights.gross) {
                const lumbPercent = calculateLumbPercentage(newWeights.empty, newWeights.gross);
                setWorkflowData(prev => ({
                    ...prev,
                    weights: { ...prev.weights, lumb: lumbPercent }
                }));
                
                // Trigger damage workflow if lumb > 20%
                if (lumbPercent > 20) {
                    setWorkflowData(prev => ({
                        ...prev,
                        damage: { ...prev.damage, type: 'lumbed', severity: 'high' }
                    }));
                }
            }
        }
    };

    const handleDamageReport = (damageType, severity, repairable) => {
        setWorkflowData(prev => ({
            ...prev,
            damage: { type: damageType, severity, repairable }
        }));
        
        // Auto-assign next step based on damage type
        if (damageType === 'lumbed') {
            setWorkflowData(prev => ({ ...prev, status: 'lumb-removal' }));
        } else if (damageType === 'physical' && !repairable) {
            setWorkflowData(prev => ({ ...prev, status: 'scrap' }));
        } else if (damageType === 'physical' && repairable) {
            setWorkflowData(prev => ({ ...prev, status: 'repair' }));
        }
    };

    const handleLocationUpdate = (location) => {
        setWorkflowData(prev => ({
            ...prev,
            location: { current: location, previous: prev.location.current }
        }));
    };

    const submitWorkflowData = async () => {
        try {
            const payload = {
                barrelId,
                weights: workflowData.weights,
                damage: workflowData.damage,
                location: workflowData.location,
                status: workflowData.status,
                step: currentStep,
                userRole
            };
            
            const response = await fetch('/api/barrels/tracking/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                onComplete?.(workflowData);
            }
        } catch (error) {
            console.error('Error submitting workflow data:', error);
        }
    };

    const getNextActionPrompt = () => {
        const prompts = {
            lab: {
                1: "Record empty weight and gross weight to calculate lumb percentage",
                2: "If lumb > 20%, mark as faulty and assign to lumb removal",
                3: "Update barrel location and condition",
                4: "Generate sample report and update DRC"
            },
            field_staff: {
                1: "Update barrel location at current checkpoint",
                2: "Record any visible damage or issues",
                3: "Alert users about pickup/drop status"
            },
            manager: {
                1: "Review damage reports and assign repair actions",
                2: "Approve barrels back into circulation after repair"
            }
        };
        
        return prompts[userRole]?.[currentStep] || "Complete current step to proceed";
    };

    if (!barrel) return <div>Loading barrel data...</div>;

    return (
        <div className="barrel-tracking-workflow">
            <RoleDashboardCard title={`Barrel Tracking - ${barrel.barrelId}`} className="mb-6">
                <ProgressIndicator 
                    progress={(currentStep / totalSteps) * 100}
                    label={`Step ${currentStep} of ${totalSteps}`}
                />
                
                {/* Step 1: Weight Recording (Lab) */}
                {userRole === 'lab' && currentStep === 1 && (
                    <div className="workflow-step">
                        <h4>Weight Recording</h4>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Empty Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={workflowData.weights.empty || ''}
                                    onChange={(e) => handleWeightUpdate('emptyWeight', e.target.value)}
                                    className={validationErrors.emptyWeight ? 'error' : ''}
                                />
                                {validationErrors.emptyWeight && (
                                    <span className="error-message">{validationErrors.emptyWeight}</span>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label>Gross Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={workflowData.weights.gross || ''}
                                    onChange={(e) => handleWeightUpdate('grossWeight', e.target.value)}
                                    className={validationErrors.grossWeight ? 'error' : ''}
                                />
                                {validationErrors.grossWeight && (
                                    <span className="error-message">{validationErrors.grossWeight}</span>
                                )}
                            </div>
                            
                            {workflowData.weights.lumb !== null && (
                                <div className="form-group">
                                    <label>Lumb Percentage</label>
                                    <div className={`lumb-indicator ${workflowData.weights.lumb > 20 ? 'warning' : 'success'}`}>
                                        {workflowData.weights.lumb.toFixed(2)}%
                                        {workflowData.weights.lumb > 20 && (
                                            <StatusIndicator status="warning">Faulty Barrel</StatusIndicator>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Step 2: Damage Assessment */}
                {currentStep === 2 && (
                    <div className="workflow-step">
                        <h4>Damage Assessment</h4>
                        <div className="damage-options">
                            <div className="damage-type">
                                <label>Damage Type</label>
                                <select 
                                    value={workflowData.damage.type || ''}
                                    onChange={(e) => handleDamageReport(e.target.value, workflowData.damage.severity, workflowData.damage.repairable)}
                                >
                                    <option value="">Select damage type</option>
                                    <option value="lumbed">Lumbed</option>
                                    <option value="physical">Physical Damage</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            {workflowData.damage.type === 'physical' && (
                                <div className="repairable-check">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={workflowData.damage.repairable || false}
                                            onChange={(e) => handleDamageReport(workflowData.damage.type, workflowData.damage.severity, e.target.checked)}
                                        />
                                        Repairable
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Step 3: Location Update */}
                {currentStep === 3 && (
                    <div className="workflow-step">
                        <h4>Location Update</h4>
                        <div className="location-selector">
                            <label>Current Location</label>
                            <select 
                                value={workflowData.location.current || ''}
                                onChange={(e) => handleLocationUpdate(e.target.value)}
                            >
                                <option value="">Select location</option>
                                <option value="yard">Yard</option>
                                <option value="lab">Lab</option>
                                <option value="lumb-bay">Lumb Removal Bay</option>
                                <option value="repair-bay">Repair Bay</option>
                                <option value="scrap-yard">Scrap Yard</option>
                                <option value="in-transit">In Transit</option>
                            </select>
                        </div>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="workflow-actions">
                    <RoleButton
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        variant="outline"
                        disabled={currentStep === 1}
                    >
                        Previous
                    </RoleButton>
                    
                    <RoleButton
                        onClick={() => {
                            if (currentStep < totalSteps) {
                                setCurrentStep(currentStep + 1);
                            } else {
                                submitWorkflowData();
                            }
                        }}
                        disabled={!canProceed()}
                    >
                        {currentStep < totalSteps ? 'Next' : 'Complete'}
                    </RoleButton>
                </div>
            </RoleDashboardCard>
            
            {/* Floating Prompt */}
            <FloatingPrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
            >
                <div className="prompt-content">
                    <h5>Next Action</h5>
                    <p>{getNextActionPrompt()}</p>
                </div>
            </FloatingPrompt>
        </div>
    );
    
    function canProceed() {
        switch (currentStep) {
            case 1:
                return userRole !== 'lab' || (workflowData.weights.empty && workflowData.weights.gross);
            case 2:
                return workflowData.damage.type;
            case 3:
                return workflowData.location.current;
            default:
                return true;
        }
    }
};

// Damage Management Component
export const DamageManagement = ({ barrelId }) => {
    const { userRole } = useRoleTheme();
    const [damages, setDamages] = useState([]);
    const [selectedDamage, setSelectedDamage] = useState(null);
    const [repairJobs, setRepairJobs] = useState([]);

    useEffect(() => {
        fetchDamages();
        fetchRepairJobs();
    }, [barrelId]);

    const fetchDamages = async () => {
        try {
            const response = await fetch(`/api/damages?barrelId=${barrelId}`);
            const data = await response.json();
            setDamages(data);
        } catch (error) {
            console.error('Error fetching damages:', error);
        }
    };

    const fetchRepairJobs = async () => {
        try {
            const response = await fetch(`/api/repairs?barrelId=${barrelId}`);
            const data = await response.json();
            setRepairJobs(data);
        } catch (error) {
            console.error('Error fetching repair jobs:', error);
        }
    };

    const assignRepairAction = async (damageId, action) => {
        try {
            const response = await fetch(`/api/damages/${damageId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: action })
            });
            
            if (response.ok) {
                fetchDamages();
            }
        } catch (error) {
            console.error('Error assigning repair action:', error);
        }
    };

    const approveRepair = async (repairId) => {
        try {
            const response = await fetch(`/api/repairs/${repairId}/approve`, {
                method: 'POST'
            });
            
            if (response.ok) {
                fetchRepairJobs();
                fetchDamages();
            }
        } catch (error) {
            console.error('Error approving repair:', error);
        }
    };

    return (
        <div className="damage-management">
            <RoleDashboardCard title="Damage Management" className="mb-6">
                <div className="damage-list">
                    {damages.map(damage => (
                        <div key={damage._id} className="damage-item">
                            <div className="damage-info">
                                <h5>Damage #{damage._id.slice(-6)}</h5>
                                <StatusIndicator status={damage.status === 'open' ? 'warning' : 'success'}>
                                    {damage.status}
                                </StatusIndicator>
                                <p>Type: {damage.damageType}</p>
                                {damage.lumbPercent && (
                                    <p>Lumb: {damage.lumbPercent.toFixed(2)}%</p>
                                )}
                            </div>
                            
                            {userRole === 'manager' && damage.status === 'open' && (
                                <div className="damage-actions">
                                    <RoleButton
                                        onClick={() => assignRepairAction(damage._id, 'lumb-removal')}
                                        size="small"
                                        disabled={damage.damageType !== 'lumbed'}
                                    >
                                        Lumb Removal
                                    </RoleButton>
                                    <RoleButton
                                        onClick={() => assignRepairAction(damage._id, 'repair')}
                                        size="small"
                                        disabled={damage.damageType !== 'physical'}
                                    >
                                        Repair
                                    </RoleButton>
                                    <RoleButton
                                        onClick={() => assignRepairAction(damage._id, 'scrap')}
                                        size="small"
                                        variant="outline"
                                    >
                                        Scrap
                                    </RoleButton>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </RoleDashboardCard>
            
            <RoleDashboardCard title="Repair Jobs" className="mb-6">
                <div className="repair-list">
                    {repairJobs.map(job => (
                        <div key={job._id} className="repair-item">
                            <div className="repair-info">
                                <h5>Job #{job._id.slice(-6)}</h5>
                                <StatusIndicator status={job.status === 'completed' ? 'success' : 'warning'}>
                                    {job.status}
                                </StatusIndicator>
                                <p>Type: {job.type}</p>
                                <p>Started: {new Date(job.createdAt).toLocaleDateString()}</p>
                            </div>
                            
                            {userRole === 'manager' && job.status === 'completed' && (
                                <div className="repair-actions">
                                    <RoleButton
                                        onClick={() => approveRepair(job._id)}
                                        size="small"
                                    >
                                        Approve
                                    </RoleButton>
                                    <RoleButton
                                        onClick={() => {/* Reject repair */}}
                                        size="small"
                                        variant="outline"
                                    >
                                        Reject
                                    </RoleButton>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </RoleDashboardCard>
        </div>
    );
};

export default BarrelTrackingWorkflow;

