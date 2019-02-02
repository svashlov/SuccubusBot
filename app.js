
const Discord = require('discord.js');
const client = new Discord.Client(); // this is the bot

const config = require('./utils/config.json');

// Responses for certain contents in message
const botResponses = require('./utils/botResponses.json');

// Commands (also contains multi-use variable "vars"):
const commands = require('./commands/commands.js');


client.on("ready", () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log(`Bot has started. Listening...`); 
	// Change bot's playing game:
	client.user.setActivity(`Escribe !help para mostrar listado de comandos.`);
});

client.on('message', function(messageData) {

	// Ignoramos el mensaje si el autor es el bot
	if(messageData.author.bot) return;

	// Guardamos en variables si el usuario es administrador o moderador
	messageData.isAdmin = messageData.member.roles.find('name', 'administradores');
	messageData.isMod = true; // messageData.member.roles.find('name', 'moderadores');

	// Comprobamos si es un comando
	if(!checkBotCommand(messageData)) {
		// Si no es un comando, comprobamos si tiene una respuesta de bot
		var botResponse = checkBotResponse(messageData);
		if (botResponse) {
			messageData.channel.send(botResponse);
			return true;
		} else {
			// En caso de no ser comando ni tener respuesta de bot, no hacer nada:
			return false;
		}
	}
});




// FUNCTIONS

function checkBotCommand(messageData) {
	// Si el mensaje no es un comando, salimos de esta función:
	if(messageData.content[0] !== config.commandPrefix) return false;
	
	// Distinguimos nombre del comando y argumentos
	const args = messageData.content.replace(config.commandPrefix, '').trim().split(/ +/g);
    const commandKey = args.shift().toLowerCase();

    // Comprobamos si el comando es válido
	if (commands[commandKey]) {
		// Comando VALIDO (se ejecuta)
		// Cogemos al primer miembro mencionado en el comando (si lo hay)
		var member = messageData.mentions.members.first() || messageData.guild.members.get(args[0]);
		commands[commandKey](messageData, args, member);
	} else {
		// Comando INVALIDO (se ignora)
		//messageData.reply("Ese comando no existe... Comprueba que lo has escrito bien, kupó!");
	}
	return true; // aunque lleve el commandPrefix se trata como comando, pese a ser inválido
}


function checkBotResponse(messageData) {
	// Texto del mensaje:
	var message = messageData.content;
	
	// Comparación literal
	for(key in botResponses.says) {
		if (message.toLowerCase().replace(',', '') == key) {
			return manageResponseMessage(messageData, botResponses.says, key)
		}
	}
	// Texto contiene...
	for(key in botResponses.contains) {
		if (~message.toLowerCase().replace(',', '').indexOf(key)) {
			return manageResponseMessage(messageData, botResponses.contains, key)
		}
	}
	return false;
}


function manageResponseMessage(messageData, list, key) {
	var responseMessage = list[key];
	if(typeof responseMessage == 'string') {
		// Respond with corresponding string
		return responseMessage.replace('##user##', messageData.member);
	} else if (typeof responseMessage == 'object') {
		// Respond with one of the many options available
		return responseMessage[Math.floor(Math.random() * responseMessage.length)].replace('##user##', messageData.member);;
	} else if (typeof responseMessage == 'function') {
		// Respond executing the corresponding function
		return responseMessage(messageData);
	}
}



// Init BOT with all settings
client.login(config.token);
