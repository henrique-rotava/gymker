angular.module('notificationservices', [])

.factory('NotificationRepository', ['DataBase', function(DataBase){
	
	var addNotificationToUser = function(user, notification, propertyName){
		var notifications = user[propertyName] || [];
		notifications.push(notification.id);
		user[propertyName] = notifications;
	}
	
	var update = function(notification, callback){
		DataBase.rel.save('notification',
			// save the notification
			notification
			
		).then(function(result){
			return DataBase.rel.find('notification', notification.id);
		}).then(function(result){	
			var dbNotification = DataBase.parseResponse('notification', notification.id, angular.copy(result));
			callback(false, dbNotification);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	var save = function(senderId, recipientId, notification, callback){
		
		notification.sender = senderId;
		notification.read = false;
		
		DataBase.rel.save('notification',
			// save the notification
			notification
			
		).then(function(result){
			
			notification = result.notifications[0];
			// find the recipient
			return DataBase.rel.find('user', recipientId);
			
		}).then(function(result){
			
			var recipient = result.users[0];
			addNotificationToUser(recipient, notification, 'unreadNotifications');
			// save recipient
			return DataBase.rel.save('user', recipient);
			
		}).then(function(result){
			
			// find sender
			return DataBase.rel.find('user', senderId);
			
		}).then(function(result){
			
			var sender = result.users[0];
			addNotificationToUser(sender, notification, 'sentNotifications');
			// save sender
			return DataBase.rel.save('user', sender);
			
		}).then(function(result){
			
			// find full sender again
			return DataBase.rel.find('user', senderId);
			
		}).then(function(result){
			
			// return sender
			var user = DataBase.parseResponse('user', senderId, result);
			callback(false, user);
			
		}).catch(function(err){
			callback(true, err);
		});
	};
	
	var read = function(user, notification, callback){
		var notificationId = notification.id;
		notification.read = true;
		readUserNotification(user, notification);
		
		DataBase.rel.save('notification', notification)
		.then(function(result){
			return DataBase.rel.save('user', user);
		}).then(function(result){
			return DataBase.rel.find('user', user.id);
		}).then(function(result){
			var userResult = DataBase.parseResponse('user', user.id, result);
			callback(false, userResult);
		}).catch(function(result){
			callback(true, result);
		});
	};
	
	var readUserNotification = function(user, notification){
		// remove from unread
		var notificationId = notification.id;
		var index = user.unreadNotifications.indexOf(notification);
		console.log(index);
		if (index > -1) {
			user.unreadNotifications.splice(index, 1);
		}
		// add to read
		user.readNotifications = user.readNotifications || [];
		user.readNotifications.splice(0, 0, notificationId);
	};
	
	var get = function(id, callback){
		DataBase.rel.find('notification', 
			id
		).then(function (result) {
			console.log(result);
			var user = DataBase.parseResponse('notification', id, angular.copy(result));
			callback(false, user);
		}).catch(function (err) {
			callback(true, err);
		});
	};
	
	return {
		save: save,
		read: read,
		get: get,
		update: update
	}
	
}])