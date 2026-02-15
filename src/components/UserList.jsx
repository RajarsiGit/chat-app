import './UserList.css';

export default function UserList({ users, currentUser, activeChat, onSelectUser }) {
  return (
    <div className="user-list">
      <div className="user-list-header">
        <span className="current-user">{currentUser}</span>
        <span className="status-dot connected" />
      </div>
      <div className="user-list-title">Online Users</div>
      {users.length === 0 ? (
        <div className="no-users">No other users online</div>
      ) : (
        <ul>
          {users.map((user) => (
            <li
              key={user}
              className={user === activeChat ? 'active' : ''}
              onClick={() => onSelectUser(user)}
            >
              <span className="status-dot connected" />
              <span className="user-name">{user}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
