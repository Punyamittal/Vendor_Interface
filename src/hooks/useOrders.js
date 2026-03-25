import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersStart, setLiveOrders, setPastOrders, updateOrderStatus, ordersError } from '../store/ordersSlice';
import { orderService } from '../services/orderService';

export const useOrders = () => {
  const dispatch = useDispatch();
  const { liveOrders, pastOrders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const fetchLiveOrders = async () => {
    if (!user) return;
    dispatch(fetchOrdersStart());
    try {
      const orders = await orderService.getLiveOrders(user.shopId);
      dispatch(setLiveOrders(orders));
    } catch (err) {
      dispatch(ordersError(err.message));
    }
  };

  const fetchPastOrders = async (filters) => {
    if (!user) return;
    dispatch(fetchOrdersStart());
    try {
      const orders = await orderService.getPastOrders(user.shopId, filters);
      dispatch(setPastOrders(orders));
    } catch (err) {
      dispatch(ordersError(err.message));
    }
  };

  const changeOrderStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      dispatch(updateOrderStatus({ orderId, status }));
    } catch (err) {
      dispatch(ordersError(err.message));
    }
  };

  return { liveOrders, pastOrders, loading, error, fetchLiveOrders, fetchPastOrders, changeOrderStatus };
};
