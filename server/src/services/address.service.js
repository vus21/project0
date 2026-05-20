import { Address } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class AddressService {
  async getUserAddresses(userId) {
    return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async createAddress(userId, addressData) {
    const count = await Address.countDocuments({ user: userId });
    if (count >= 5) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Bạn chỉ được tạo tối đa 5 địa chỉ');
    }

    if (addressData.isDefault || count === 0) {
      addressData.isDefault = true;
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await Address.create({ ...addressData, user: userId });
    return address;
  }

  async updateAddress(addressId, userId, data) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Địa chỉ không tồn tại');

    if (data.isDefault) {
      await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { isDefault: false });
    }

    Object.assign(address, data);
    await address.save();
    return address;
  }

  async deleteAddress(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Địa chỉ không tồn tại');

    const wasDefault = address.isDefault;
    await address.deleteOne();

    if (wasDefault) {
      const latestAddress = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
      if (latestAddress) {
        latestAddress.isDefault = true;
        await latestAddress.save();
      }
    }

    return true;
  }

  async setDefaultAddress(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Địa chỉ không tồn tại');

    await Address.updateMany({ user: userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    return address;
  }
}

export const addressService = new AddressService();
