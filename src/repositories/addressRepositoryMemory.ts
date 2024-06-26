import {AddressType} from "../types";
import {AddressMapper} from "../utils/getResFunctions";

export let addresses: AddressType[] = [
    {id: 1, value: "Mira 7", postalCode: '1500'},
    {id: 2, value: "Ulentsi 23", postalCode: '1500'},
]
export const addressRepositoryMemory = {
    fetchAddresses() {
        return addresses.map(AddressMapper)
    },
    findAddress(id: number) {
        const address = addresses.find(a => a.id === id)
        return address && AddressMapper(address)
    },
    deleteAddress(id: number) {
        const arrayId = addresses.findIndex(a => a.id === id)
        if (arrayId > -1) {
            addresses.splice(arrayId, 1)
            return true
        }
    },
    updateAddress (id:number, newValue:string) {
        const address = addresses.find(a => a.id === id);
        if (address) {
            address.value = newValue
           return AddressMapper(address)
        }
    },
    createAddress (value:string) {
        const maxId = addresses.reduce((mId, a) => mId < a.id ? a.id : mId, 0);
        const address: AddressType = {id: maxId + 1, value, postalCode: "000000"}
        addresses.push(address)
        return AddressMapper(addresses[addresses.length - 1])
    }

}
