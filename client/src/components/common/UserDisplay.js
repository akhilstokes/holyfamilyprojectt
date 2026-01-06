import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserDisplay = ({ 
  showAvatar = true, 
  showName = true, 
  showRole = true, 
  showEmail = false,
  layout = 'horizontal', // 'horizontal' or 'vertical'
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  style = {}
}) => {
  const { user } = useAuth();

  if (!user) return null;

  const sizes = {
    small: {
      avatar: '24px',
      nameFont: '12px',
      roleFont: '10px',
      emailFont: '10px'
    },
    medium: {
      avatar: '32px',
      nameFont: '14px',
      roleFont: '12px',
      emailFont: '11px'
    },
    large: {
      avatar: '40px',
      nameFont: '16px',
      roleFont: '14px',
      emailFont: '12px'
    }
  };

  const sizeConfig = sizes[size] || sizes.medium;

  const formatRole = (role) => {
    if (!role) return 'User';
    return role.replace(/_/g, ' ').toUpperCase();
  };

  const containerStyle = {
    display: 'flex',
    alignItems: layout === 'horizontal' ? 'center' : 'flex-start',
    flexDirection: layout === 'horizontal' ? 'row' : 'column',
    gap: layout === 'horizontal' ? '8px' : '4px',
    ...style
  };

  const avatarStyle = {
    width: sizeConfig.avatar,
    height: sizeConfig.avatar,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: `calc(${sizeConfig.avatar} * 0.4)`,
    fontWeight: '600',
    flexShrink: 0
  };

  const textContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: layout === 'horizontal' ? 'flex-start' : 'center',
    gap: '2px'
  };

  const nameStyle = {
    fontSize: sizeConfig.nameFont,
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    lineHeight: 1.2
  };

  const roleStyle = {
    fontSize: sizeConfig.roleFont,
    fontWeight: '500',
    color: '#64748b',
    background: 'rgba(59, 130, 246, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    margin: 0,
    lineHeight: 1
  };

  const emailStyle = {
    fontSize: sizeConfig.emailFont,
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.2
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`user-display ${className}`} style={containerStyle}>
      {showAvatar && (
        <div style={avatarStyle}>
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                objectFit: 'cover' 
              }} 
            />
          ) : (
            getInitials(user.name)
          )}
        </div>
      )}
      
      <div style={textContainerStyle}>
        {showName && (
          <div style={nameStyle}>
            {user.name || 'User'}
          </div>
        )}
        
        {showRole && (
          <div style={roleStyle}>
            {formatRole(user.role)}
          </div>
        )}
        
        {showEmail && user.email && (
          <div style={emailStyle}>
            {user.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDisplay;