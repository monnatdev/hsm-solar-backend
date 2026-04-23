declare module "thai-address-database" {
  interface AddressEntry {
    district: string
    amphoe: string
    province: string
    zipcode: string
  }

  function searchAddressByDistrict(term: string): AddressEntry[]
  function searchAddressByAmphoe(term: string): AddressEntry[]
  function searchAddressByProvince(term: string): AddressEntry[]
  function searchAddressByZipcode(term: string | number): AddressEntry[]
  function splitAddress(text: string): AddressEntry | null
}
