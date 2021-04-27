module.exports = function learnSkill(mod) {
	const { 'tera-game-state': game } = mod.require;
	game.initialize(['inventory', 'contract']);
	const { me, inventory } = game;

	const reqSkillList = () => mod.send('C_SKILL_LEARN_LIST', 2);

	const reqSkillListWhenPossible = () => {
		if (me.inCombat) {
			me.once('leave_combat', () => {
				if (me.mounted) me.once('dismount', reqSkillList);
				else reqSkillList();
			});
		} else if (me.mounted) {
			me.once('dismount', () => {
				if (me.inCombat) me.once('leave_combat', reqSkillList);
				else reqSkillList();
			});
		} else reqSkillList();
	};

	me.on('change_level', level => {
		if (level <= 65) reqSkillListWhenPossible();
	});

	mod.hook('S_SKILL_LEARN_LIST', 2, e => {
		for (const skill of e.skills) {
			if (!skill.active || !skill.available || skill.requiredMoney >= inventory.money) continue;
			mod.send('C_SKILL_LEARN_REQUEST', 2, { id: skill.id, active: true });
		}
	});
};
