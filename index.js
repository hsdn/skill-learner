module.exports = function learnSkill(mod) {
	mod.game.initialize(["inventory", "contract"]);

	const reqSkillList = () => mod.send("C_SKILL_LEARN_LIST", 2);

	const reqSkillListWhenPossible = () => {
		if (mod.game.me.inCombat) {
			mod.game.me.once("leave_combat", () => {
				if (mod.game.me.mounted)
					mod.game.me.once("dismount", reqSkillList);
				else
					reqSkillList();
			});
		} else if (mod.game.me.mounted) {
			mod.game.me.once("dismount", () => {
				if (mod.game.me.inCombat)
					mod.game.me.once("leave_combat", reqSkillList);
				else
					reqSkillList();
			});
		} else
			reqSkillList();
	};

	mod.game.me.on("change_level", level => {
		if (level <= 65)
			reqSkillListWhenPossible();
	});

	mod.hook("S_SKILL_LEARN_LIST", 2, e => {
		for (const skill of e.skills) {
			if (!skill.active || !skill.available || skill.requiredMoney >= mod.game.inventory.money)
				continue;

			mod.send("C_SKILL_LEARN_REQUEST", 2, { "id": skill.id, "active": true });
		}
	});
};
