ig.module("game.feature.bee.skills.skilltree").requires("game.feature.skills.skilltree").defines(function() {
	sc.SkillTree.inject({
		overrideAutoSkills: false,
		autoSkillsOverride: [],
		autoSkill: function(skills, level, skillRanking) {
			if (this.overrideAutoSkills) {
				skills.splice(0);
				const newSkills = this.autoSkillsOverride.map((e) => this.skills[e.id]);
				skills.splice(0,0,...newSkills);
				return;
			}
			this.parent(skills, level, skillRanking);
		}
	});
});