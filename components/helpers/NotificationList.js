const React = require('react');
const classNames = require('classnames');
const InfiniteScroll = require('react-infinite-scroller');

function NotificationList(props) {
  const { notifications, onItemClick, hasMore, loadMore, activeId } = props;
  return (
    <div className="notification-list scrollable">
      <InfiniteScroll
        pageStart={0}
        initialLoad={false}
        loadMore={loadMore}
        hasMore={hasMore}
        useWindow={false}
        threshold={10}
      >
        <ul className="list-unstyled">
          {
            notifications.map((notification) => {
              const notificationClass = notification.acknowledgedOn ? 'read' : 'unread';
              const activeClass = notification.id === activeId ? 'active' : '';
              return (
                <li 
                  key={notification.id} 
                  className={classNames(notificationClass, activeClass)} 
                >
                  <a onClick={() => onItemClick(notification.id, notification.type)}>
                    <i /> 
                    <span>{notification.title}</span>
                  </a>
                </li>
              );
            })
          }
        </ul>
      </InfiniteScroll>
    </div>
  );
}

module.exports = NotificationList;

