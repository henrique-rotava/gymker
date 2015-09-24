angular.module('notificationservices', [])

.factory('NotificationRepository', ['DataBase', function(DataBase){
	
	var addNotificationToUser = function(user, notification, propertyName){
		var notifications = user[propertyName] || [];
		notifications.push(notification.id);
		user[propertyName] = notifications;
	}
	
	var save = function(senderId, recipientId, notification, callback, justSendIfOtherPerson){
		
		DataBase.rel.save('notification',
			// salva the notification
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
	
	return {
		save: save
	}
	
}])