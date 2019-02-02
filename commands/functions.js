

function checkRequirements(requirements) {
	var testPassed = true;
	requirements.forEach(function(requirement) {
		if (!requirement) { testPassed = false; }
	});
	return testPassed;
}


function writeLog(messageData, logMessage) {
	console.log('Escribir en log:', logMessage);
	// Guardamos el canal de texto al que se va a enviar el mensaje (log):
	let channel = messageData.member.guild.channels.find('name', 'log');
	// Si no encuentra el canal, finaliza la función
	if (!channel) return;
	// si lo encuentra, envía el mensaje (debería encontrarlo siempre...)
	channel.send(logMessage);
}


function getSubArgs(args) {
	args = args.join(' ').trim();
	args = args.split('--');
	var subargs = {};
	args.forEach(function (subarg) {
		if(subarg){
			subarg = subarg.split(' ');
			let key = subarg.shift();
			subarg = subarg.join(' ');
			subargs[key] = subarg;
		}
	});
	return subargs;
}


function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = {
	checkRequirements: checkRequirements,
	writeLog: writeLog,
	getSubArgs: getSubArgs,
	getRandomNumber: getRandomNumber
}
