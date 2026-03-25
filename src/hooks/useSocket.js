import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { socketService } from '../services/socketService';
import { setLiveOrders, addOrder, updateOrderStatus } from '../store/ordersSlice';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useSocket = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && user) {
      socketService.init(token);

      socketService.on(SOCKET_EVENTS.NEW_ORDER, (newOrder) => {
        dispatch(addOrder(newOrder));
        // Audio ping
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio error:', e));
      });

      socketService.on(SOCKET_EVENTS.ORDER_UPDATED, (update) => {
        dispatch(updateOrderStatus(update));
      });
    }

    return () => {
      // Don't disconnect on every re-render, only on logout or final unmount
    };
  }, [token, user, dispatch]);

  const emitStatusUpdate = (orderId, status) => {
    socketService.emit(SOCKET_EVENTS.ORDER_STATUS_UPDATE, { orderId, status });
  };

  return { emitStatusUpdate };
};
