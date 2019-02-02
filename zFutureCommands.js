 var futureCommands = {
 	// Obtener listado de gente baneada
 	"fetchBans" : function(messageData, args) {
		if(messageData.isAdmin && messageData.channel.name == 'admin'){
			// Only available for admins in admin channel
			messageData.guild.fetchBans()
				.then(function(bans) {
					messageData.channel.send('--------------\nBANNED USERS:');
					bans.forEach(function(ban) {
						messageData.channel.send(`- ${ban.username}#${ban.discriminator}`);
					});
					messageData.channel.send('--------------');
				});
		}
		messageData.delete();
	},




	"crearsorteo" : function(messageData, args) {
		if (!checkRequirements([messageData.isAdmin || messageData.isMod])) { return messageData.reply("Necesitas ser al menos moderador para crear un sorteo, kupó!"); }
		const sorteo = args[0].toLowerCase();
		if(~vars.sorteos.indexOf(sorteo)) {
			messageData.reply("Ese sorteo ya existe");
		} else {
			vars.sorteos.push(sorteo);
			// Cogemos la DB manufacturada, le metemos el sorteo nuevo y lo guardamos (si ya existe, se queda igual)
			var participantesSorteos = JSON.parse(fs.readFileSync('db/sorteos.json', 'utf8'));
			participantesSorteos[sorteo] = participantesSorteos[sorteo] || [];
			fs.writeFileSync('db/sorteos.json', JSON.stringify(participantesSorteos));
			messageData.reply("Se ha creado un nuevo sorteo: " + sorteo);
		}
	},
	
	"participar" : function(messageData, args) {
		const sorteo = args[0];
		var db = { sorteos: JSON.parse(fs.readFileSync('db/sorteos.json', 'utf8')) };
		var participantesSorteo = db.sorteos[sorteo];
		var user = `${messageData.author.username}#${messageData.author.discriminator}`;
		if(!participantesSorteo) {
			messageData.reply("Ese sorteo no existe");
		} else if(participantesSorteo) {
			console.log(`Usuario ${user} se une al sorteo ${sorteo}`);
			participantesSorteo.push(user);
			db.sorteos[sorteo] = participantesSorteo;
			fs.writeFileSync('db/sorteos.json', JSON.stringify(db.sorteos));
			messageData.reply("Se ha almacenado tu participación en el sorteo!*");
		}
	}
 }