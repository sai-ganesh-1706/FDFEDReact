import React from 'react';

export default function CATopbar({ title, userName, avatarInitials }) {
  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        <span className="user-name">{userName}</span>
        <div className="avatar">{avatarInitials}</div>
      </div>
    </header>
  );
}

