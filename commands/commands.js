
const fs = require('fs');

const functions = require('./functions.js');
var cooldowns = {};

var cooldownTimes = {
	farm: 90
}

// @todo Load here the DB stuff, improve the system

module.exports = {

	// GAME COMMANDS
	"start" : function(messageData) {
		// Store variables for user (to mention), username and userId
		var user = messageData.author;
		var userId = user.id;
		var username = user.username + "#" + user.discriminator;
		messageData.channel.send("Cargando base de datos...");
		var dbPlayers = getPlayers();
		messageData.channel.send("Comprobando disponibilidad...");
		if(!dbPlayers[userId]) {
			messageData.channel.send(`Comenzando juego para ${user}...`);
			dbPlayers[userId] = { level: 1, coins: 0, job: "Novice", description: "[Inserta aquí una descripción de tu personaje con el comando !description]" };
			savePlayers(dbPlayers);			
			messageData.channel.send("Te doy la bienvenida a mi juego... Muahahahaha.");
		} else {
			messageData.channel.send(`Tu juego ya comenzó, ${user}. No hace falta volver a ejecutar este comando.`);
		}
	},

	"profile" : function(messageData, args, member) {
		var user = member?member:messageData.author;
		var player = getPlayer(user.id);

		if(!player) {
			messageData.reply(member?"Lo siento, pero " + member + " todavía no ha creado su perfil." : "Tienes que crear tu perfil con el comando !start.");
			return false;
		}

		// Reached this point we know this player exists
		// Fetch data from player and show it on an embed
		messageData.channel.send(getProfileCard(player, user));
		
	},

	"farm" : function(messageData) {

		var user = messageData.author;
		var cooldown = cooldowns[user.id]?cooldowns[user.id].farm:null;

		if(cooldown) {
			var cooldownTime = new Date(cooldown).getTime();
			var currentTime = new Date().getTime();
			var diffTime = currentTime-cooldownTime;
			if(diffTime < 0) { return messageData.reply("Debes esperar " + Math.floor(Math.abs(diffTime)/1000) + " segundos para volver a lanzar este comando."); }
		}
		
		var dbPlayers = getPlayers();
		var player = dbPlayers[user.id];
		if(!player) {
			messageData.reply("Tienes que crear tu perfil con el comando !start");
			return false;
		} else {
			var coinsReceived = functions.getRandomNumber(1, 100);
			messageData.channel.send("Felicidades, " + user + ". Has conseguido " + coinsReceived + "€.");
			player.coins += coinsReceived;
			savePlayers(dbPlayers);
			// Set cooldown
			setCooldown("farm", cooldownTimes.farm, user.id);
		}
	},

	"description" : function(messageData, args) {
		var dbPlayers = getPlayers();
		var player = dbPlayers[messageData.author.id];
		player.description = args.join(" ");
		savePlayers(dbPlayers);
		messageData.reply("Se ha actualizado la descripción de tu personaje.");
	},

	"help" : function(messageData) {
		messageData.channel.send(showCommandsHelp());
	},


	// FUN COMMANDS
	"dice" : function(messageData, args) {
		if(!args[0]) { return messageData.reply('Debes indicar un número máximo, por ejemplo: !dice 20!') }
		var maxNumber = parseInt(args[0]);
		messageData.reply('Has sacado un ' + (Math.floor(Math.random() * maxNumber) + (maxNumber >= 0?1:0)) + ' (dado de ' + maxNumber + ' caras)');
	},
	"pizza" : function(messageData) {
		var dbPlayers = getPlayers();
		var player = dbPlayers[messageData.author.id];
		if(player.coins >= 10) {
			player.coins -= 10;
			savePlayers(dbPlayers);
			messageData.reply("Son 10€. ¡¡Gracias por su compra y buen provecho!! :pizza:♥");
		} else {
			messageData.reply("Vas mal de pasta, ¿eh? Farmea un poco y ya luego hablamos.");
		}
	},
	"dickslap" : function(messageData) {
		messageData.reply("https://media.giphy.com/media/Qc8GJi3L3Jqko/giphy.gif");
	},
	"say" : function(messageData, args) {
		if (!functions.checkRequirements([messageData.isAdmin || messageData.isMod])) return false;
		messageData.channel.send(args.join(" "));
		messageData.delete();
	},


	// UTILITY COMMANDS
	"clear" : function(messageData, args) {
		// This command removes all messages from all users in the channel, up to 100.
		if (!functions.checkRequirements([messageData.isAdmin || messageData.isMod])) {
			return messageData.reply('Solo los administradores y moderadores pueden utilizar este tipo de comandos!');
		}
		// get the delete count, as an actual number.
		const deleteCount = parseInt(args[0]);
		// DeleteCount tiene que estar entre 2 y 100
		if(!deleteCount || deleteCount < 2 || deleteCount > 100) {
			return messageData.reply("ERROR: Se necesita un número entre 2 y 100 para ejecutar el comando 'clear'!.");
		}
		// So we get our messages, and delete them. Simple enough, right?
		messageData.channel.fetchMessages({limit: deleteCount})
			.then(function(fetched) {
				messageData.channel.bulkDelete(fetched)
					.catch(function(error) { messageData.reply('No pude limpiar los mensajes: ' + error); });
			});
	}

}


// Get a single player's data from DB (read only)
function getPlayer(playerId) {
	return getPlayers()[playerId];
}

// Get players data from db
function getPlayers() {
	var stringDbPlayers = fs.readFileSync('db/players.json', 'utf8');
	if(!stringDbPlayers) stringDbPlayers = "{}";
	return JSON.parse(stringDbPlayers);
}

// Store players data in db
function savePlayers(dbPlayers) {
	if(typeof dbPlayers != "object") {
		console.error("ERROR: savePlayers() was called without a valid JSON object");
		return false;
	}
	fs.writeFileSync('db/players.json', JSON.stringify(dbPlayers));
}

function setCooldown(key, cdTime, userId) {
	var cooldownDate = new Date(); 
	cooldownDate.setSeconds(cooldownDate.getSeconds() + cdTime);
	cooldowns[userId] = cooldowns[userId] || {};
	cooldowns[userId][key] = cooldownDate;
}

// Show the player profile, but cooler
function getProfileCard(player, user) {
	return {"embed": embed = {
		color: 6447003,
		author: {
			name: user.username,
			icon_url: user.avatarURL
		},
		title: "Personaje de " + user.username,
		description: player.description,
		fields: [
			{
				name: "Nivel",
				value: player.level
			},
			{
				name: "Dinero",
				value: player.coins + "€"
			}
		]
	} }; // This double "}" is on purpose
}

// Show commands and instructions
function showCommandsHelp() {
	return {"embed": embed = {
		color: 3447003,
		author: {
			name: "Succubus",
			icon_url: "https://vignette.wikia.nocookie.net/finalfantasy/images/8/81/FFD2_Jornee_Succubus_1_Art.png/revision/latest?cb=20180213004423"
		},
		title: "Echa un vistazo a mis comandos.",
		description: "¿Necesitas un cable? Aquí tienes mi listado completo de comandos, clasificados por categorías y con su explicación.",
		fields: [
			{
				name: "Comandos de Juego",
				value: "" 
					+ "\n `!start: Inicia el juego. Este comando solamente funciona una vez.`"
					+ "\n `!profile: Muestra tu perfil del juego.`"
					+ "\n `!description <descripción>: Actualiza la descripción de tu personaje.`"
					+ "\n `!farm: Consigues algo de dinero.`"
					+ "\n `!help: Muestra todos los comandos disponibles del juego.`"
			},
			{
				name: "Comandos de broma",
				value: ""
					+ "\n `!pizza: Compras una pizza. Cuesta solo 10€.`"
			}, 
			{
				name: "Utilidades",
				value: "" 
					+ "\n `!clear <cantidad>: Elimina una cantidad de mensajes. La cantidad debe ser un número entre 2 y 100.`"
			}
		]
	} }; // This double } is on purpose
}

