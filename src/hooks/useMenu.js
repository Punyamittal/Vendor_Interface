import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuStart, setItems, addItem, updateItem, removeItem, updateItemAvailability, menuError } from '../store/menuSlice';
import { menuService } from '../services/menuService';

export const useMenu = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.menu);
  const { user } = useSelector((state) => state.auth);

  const fetchMenu = async () => {
    if (!user) return;
    dispatch(fetchMenuStart());
    try {
      const menu = await menuService.getMenuItems(user.shopId);
      dispatch(setItems(menu));
    } catch (err) {
      dispatch(menuError(err.message));
    }
  };

  const addNewItem = async (item) => {
    try {
      const newItem = await menuService.addItem({ ...item, shopId: user.shopId });
      dispatch(addItem(newItem));
    } catch (err) {
      dispatch(menuError(err.message));
    }
  };

  const editItem = async (itemId, item) => {
    try {
      const updatedItem = await menuService.updateItem(itemId, item);
      dispatch(updateItem(updatedItem));
    } catch (err) {
      dispatch(menuError(err.message));
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await menuService.deleteItem(itemId);
      dispatch(removeItem(itemId));
    } catch (err) {
      dispatch(menuError(err.message));
    }
  };

  const toggleAvailability = async (itemId, isAvailable) => {
    try {
      await menuService.updateAvailability(itemId, isAvailable);
      dispatch(updateItemAvailability({ id: itemId, isAvailable }));
    } catch (err) {
      dispatch(menuError(err.message));
    }
  };

  return { items, loading, error, fetchMenu, addNewItem, editItem, deleteItem, toggleAvailability };
};
