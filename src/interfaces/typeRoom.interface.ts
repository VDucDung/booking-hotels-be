export interface TypeRoom {
  id: number;
  hotel: {
    id: number;
    hotelName: string;
  };
}

export interface GroupedTypeRooms {
  [hotelId: number]: {
    hotelName: string;
    typeRooms: TypeRoom[];
  };
}
