

module.exports = function(app, chatRoutes,io){
	var User = require('../models/user.js');
	var Chat = require('../models/chat.js');
	var Message = require ('../models/message.js');

	chatRoutes.get('/users/:username/chat',function(req, res){

        Chat.find({

			$or:[
				{user1:req.params.username},
				{user2:req.params.username}
			],
        	isActive : true

        },
        function(err, chat) {
            console.log(chat);
            if (err){
                res.send(err);
            }else if(chat.length==0){

            	res.status(404).json({chat:"you don't have chats active"});
            }else{

            }
        });

	});

	chatRoutes.route('/users/:username1/chat/:username2')

	.get(function(req,res){
		Chat.find({
			$or:[
				{user1:req.params.username1, user2:req.params.username2},
				{user1:req.params.username2, user2:req.params.username1}
			]
		},
		'_id',
		function(err,room){
			if (err) throw err;
			
			if (room.length == 0){
				res.status(404).json({room : "Not found chat room"});
			}else{
				console.log(room[0]._id);
				res.status(200).json({room : room[0]._id});
			}

		});
	})
	.post(function(req,res){
		console.log("creando el chat");
		chat = new Chat();
		chat.user1 = req.params.username1;
		chat.user2 = req.params.username2;
		chat.isActive = true;
        chat.save(function(err) {
            if (err){
            	console.log("no se pudo crear el chat");
            	console.log(err);
                res.send(err);
            }else{

            }
        });
		res.status(201).json({room : chat._id});
	});

	chatRoutes.route('/chat/:room/messages')

		.get(function(req, res){

			Message
			.find({ chat: req.params.room })
			.limit(10)
			.sort({'date':'desc'})
			.exec(function (err, mesages) {

			if (err) 
				res.send(err);
			else
				res.json(mesages);

			});

		})
		.post(function(req, res){

	        Chat.find({
	        	_id: req.params.room
	        },
	        function(err, chat){
	            console.log(chat);
	            if (err)
	                res.send(err);
	        });


			var message = new Message();
			message.chat = req.params.room;
			message.date = Date.now();
			message.content = req.body.msg;
			message.owner = req.body.user;
			

	        message.save(function(err) {
	            if (err){
	                res.send(err);
	            }else{

	            }
	        });

			Chat.findByIdAndUpdate(
		        req.params.room,
		        {$push: {"messages": message._id}},
		        {safe: true, upsert: true, new : true},
		        function(err, model) {
		        	if(err)
		            	res.send(err);
		        }
		    );

			res.status(201).json({message:'the message was created correctly'});
		});

	var chat = io.on('connection', function (socket) {

		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){

			var room = findClientsSocket(io,data);
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {

				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			else if(room.length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id);
			// Only two people per room are allowed

			// Use the socket object to store data. Each client gets
			// their own unique socket object
			socket.username = data.user;
			socket.room = data.id;

			// Add the client to the room
			socket.join(data.id);

			if (room.length == 1) {

				var usernames = [];

				usernames.push(room[0].username);
				usernames.push(socket.username);

				// Send the startChat event to all the people in the
				// room, along with a list of people that are in it.
			}
		});

		// Somebody left the chat
		socket.on('end', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){
			// When the server receives a message, it sends it to the other person in the room.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user});
		});
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}