// address.service.js
import { Address } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class AddressService {
  async getUserAddresses(userId) {
    // Đổi user -> user_id
    return Address.find({ user_id: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async createAddress(userId, addressData) {
    // Đổi user -> user_id
    const count = await Address.countDocuments({ user_id: userId });
    if (count >= 5) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Bạn chỉ được tạo tối đa 5 địa chỉ');
    }

    if (addressData.isDefault || count === 0) {
      addressData.isDefault = true;
      // Đổi user -> user_id
      await Address.updateMany({ user_id: userId }, { isDefault: false });
    }

    // Đổi user: userId -> user_id: userId
    const address = await Address.create({ ...addressData, user_id: userId });
    return address;
  }

  async updateAddress(addressId, userId, data) {
    // Đổi user -> user_id
    const address = await Address.findOne({ _id: addressId, user_id: userId });
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Địa chỉ không tồn tại');

    if (data.isDefault) {
      // Đổi user -> user_id
      await Address.updateMany({ user_id: userId, _id: { $ne: addressId } }, { isDefault: false });
    }

    Object.assign(address, data);
    await address.save();
    return address;
  }

  async deleteAddress(addressId, userId) {
    // Đổi user -> user_id
    const address = await Address.findOne({ _id: addressId, user_id: userId });
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Địa chỉ không tồn tại');

    const wasDefault = address.isDefault;
    await address.deleteOne();

    if (wasDefault) {
      // Đổi user -> user_id
      const latestAddress = await Address.findOne({ user_id: userId }).sort({ createdAt: -1 });
      if (latestAddress) {
        latestAddress.isDefault = true;
        await latestAddress.save();
      }
    }

    return true;
  }

  async setDefaultAddress(addressId, userId) {
    // Đổi user -> user_id
    const address = await Address.findOne({ _id: addressId, user_id: userId });
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Địa chỉ không tồn tại');

    // Đổi user -> user_id
    await Address.updateMany({ user_id: userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    return address;
  }
}

export const addressService = new AddressService();