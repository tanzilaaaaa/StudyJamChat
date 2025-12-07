import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get user-specific key
const getUserKey = (userId, baseKey) => `${baseKey}_${userId}`;

// Courses - GLOBAL (shared across all users)
export const saveCourses = async (userId, courses) => {
  try {
    // Use global key instead of user-specific
    const key = '@studyjam_courses_global';
    await AsyncStorage.setItem(key, JSON.stringify(courses));
  } catch (error) {
    console.error('Error saving courses:', error);
  }
};

export const loadCourses = async (userId) => {
  try {
    // Use global key instead of user-specific
    const key = '@studyjam_courses_global';
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
};

// Study Groups
export const saveGroups = async (userId, groups) => {
  try {
    const key = getUserKey(userId, '@studyjam_groups');
    await AsyncStorage.setItem(key, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups:', error);
  }
};

export const loadGroups = async (userId) => {
  try {
    const key = getUserKey(userId, '@studyjam_groups');
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading groups:', error);
    return [];
  }
};

// Profile Data
export const saveProfile = async (userId, profile) => {
  try {
    const key = getUserKey(userId, '@studyjam_profile');
    await AsyncStorage.setItem(key, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

export const loadProfile = async (userId) => {
  try {
    const key = getUserKey(userId, '@studyjam_profile');
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : { bio: '', major: '', year: '' };
  } catch (error) {
    console.error('Error loading profile:', error);
    return { bio: '', major: '', year: '' };
  }
};

// Message Count
export const incrementMessageCount = async (userId) => {
  try {
    const key = getUserKey(userId, '@studyjam_message_count');
    const data = await AsyncStorage.getItem(key);
    const count = data ? parseInt(data) : 0;
    await AsyncStorage.setItem(key, (count + 1).toString());
    return count + 1;
  } catch (error) {
    console.error('Error incrementing message count:', error);
    return 0;
  }
};

export const getMessageCount = async (userId) => {
  try {
    const key = getUserKey(userId, '@studyjam_message_count');
    const data = await AsyncStorage.getItem(key);
    return data ? parseInt(data) : 0;
  } catch (error) {
    console.error('Error getting message count:', error);
    return 0;
  }
};

// Notifications
export const saveNotifications = async (userId, notifications) => {
  try {
    const key = getUserKey(userId, '@studyjam_notifications');
    await AsyncStorage.setItem(key, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

export const loadNotifications = async (userId) => {
  try {
    const key = getUserKey(userId, '@studyjam_notifications');
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
};

export const addNotification = async (userId, notification) => {
  try {
    const notifications = await loadNotifications(userId);
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotification);
    await saveNotifications(userId, notifications);
    return newNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
  }
};

export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notifications = await loadNotifications(userId);
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    await saveNotifications(userId, updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const getUnreadNotificationCount = async (userId) => {
  try {
    const notifications = await loadNotifications(userId);
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
