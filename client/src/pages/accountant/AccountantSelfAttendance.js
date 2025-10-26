import React from 'react';
import AttendanceMarking from '../../components/common/AttendanceMarking';
import AttendanceHistory from '../../components/common/AttendanceHistory';

const AccountantSelfAttendance = () => {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 40 }}>
        <AttendanceMarking />
      </div>
      <div>
        <AttendanceHistory staffType="accountant" />
      </div>
    </div>
  );
};

export default AccountantSelfAttendance;
