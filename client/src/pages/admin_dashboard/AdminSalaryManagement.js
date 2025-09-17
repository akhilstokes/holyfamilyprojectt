import React, { useState } from 'react';
import AdminStaffSalaryManagement from './AdminStaffSalaryManagement';
import AdminDailyWageManagement from './AdminDailyWageManagement';
import AdminMonthlyWageManagement from './AdminMonthlyWageManagement';

const AdminSalaryManagement = () => {
  const [activeSystem, setActiveSystem] = useState('staff');

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Salary Management System</h3>
              <div className="card-tools">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${activeSystem === 'staff' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveSystem('staff')}
                  >
                    Admin/Staff Salaries
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeSystem === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveSystem('daily')}
                  >
                    Daily Wage Workers
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeSystem === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveSystem('monthly')}
                  >
                    Monthly Wage Workers
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {activeSystem === 'staff' && <AdminStaffSalaryManagement />}
              {activeSystem === 'daily' && <AdminDailyWageManagement />}
              {activeSystem === 'monthly' && <AdminMonthlyWageManagement />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSalaryManagement;


