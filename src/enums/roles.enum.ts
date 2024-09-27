export enum ERole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PARTNER = 'PARTNER',
}

export const enum EUserPermission {
  // users
  CREATE_USER = 'create_user',
  GET_USERS = 'get_users',
  GET_USER = 'get_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  // roles
  CREATE_ROLE = 'create_role',
  GET_ROLES = 'get_roles',
  GET_ROLE = 'get_role',
  UPDATE_ROLE = 'update_role',
  DELETE_ROLE = 'delete_role',
  // permissions
  CREATE_PERMISSION = 'create_permission',
  GET_PERMISSIONS = 'get_permissions',
  GET_PERMISSION = 'get_permission',
  UPDATE_PERMISSION = 'update_permission',
  DELETE_PERMISSION = 'delete_permission',
  // hotels
  CREATE_HOTEL = 'create_hotel',
  GET_HOTELS = 'get_hotels',
  GET_HOTEL = 'get_hotel',
  UPDATE_HOTEL = 'update_hotel',
  DELETE_HOTEL = 'delete_hotel',
  // favorites
  CREATE_FAVORITE = 'create_favorite',
  GET_FAVORITES = 'get_favorites',
  GET_FAVORITE = 'get_favorite',
  UPDATE_FAVORITE = 'update_favorite',
  DELETE_FAVORITE = 'delete_favorite',
}
