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
  // rooms
  CREATE_ROOM = 'create_room',
  GET_ROOMS = 'get_rooms',
  GET_ROOM = 'get_room',
  UPDATE_ROOM = 'update_room',
  DELETE_ROOM = 'delete_room',
  // type_rooms
  CREATE_TYPE_ROOM = 'create_type_room',
  GET_TYPE_ROOMS = 'get_type_rooms',
  GET_TYPE_ROOM = 'get_type_room',
  UPDATE_TYPE_ROOM = 'update_type_room',
  DELETE_TYPE_ROOM = 'delete_type_room',
  // favorites
  CREATE_FAVORITE = 'create_favorite',
  GET_FAVORITES = 'get_favorites',
  GET_FAVORITE = 'get_favorite',
  UPDATE_FAVORITE = 'update_favorite',
  DELETE_FAVORITE = 'delete_favorite',
  // favorites
  CREATE_AUTH_PROVIDER = 'create_auth_provider',
  GET_AUTH_PROVIDERS = 'get_auth_providers',
  GET_AUTH_PROVIDER = 'get_auth_provider',
  UPDATE_AUTH_PROVIDER = 'update_auth_provider',
  DELETE_AUTH_PROVIDER = 'delete_auth_provider',
  // categories
  CREATE_CATEGORY = 'create_category',
  GET_CATEGORIES = 'get_categories',
  GET_CATEGORY = 'get_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',
  // reviews
  CREATE_REVIEW = 'create_REVIEW',
  GET_REVIEWS = 'get_REVIEWs',
  GET_REVIEW = 'get_REVIEW',
  UPDATE_REVIEW = 'update_REVIEW',
  DELETE_REVIEW = 'delete_REVIEW',
  // type utilities
  CREATE_TYPE_UTILITY = 'create_type_utility',
  GET_TYPE_UTILITIES = 'get_type_utilities',
  GET_TYPE_UTILITY = 'get_type_utility',
  UPDATE_TYPE_UTILITY = 'update_type_utility',
  DELETE_TYPE_UTILITY = 'delete_type_utility',
}
