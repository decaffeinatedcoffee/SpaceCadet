const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Select the roles you want')
};
