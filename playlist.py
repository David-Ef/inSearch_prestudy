#! /usr/bin/env python3
# ---------------------------------
# Author: Erwan DAVID <David@psych.uni-frankfurt.de>
# Year: 2022
# Lab: SGL, Goethe University, Frankfurt
# Comment: 
# ---------------------------------

import matplotlib.pyplot as plt
import numpy as np
import os, json

"""
	4 scenes * 2 stimuli 

	160 item trials in total (~30min without briefing/instructions/...)
		20 per stimuli

		40 per scene types

		25 coming from same scene type
		15 coming from the remainig 3 scene types
			5 per scene type

	1) Selected obj for their own scene type first
		Assign randomly to the two stimuli
	2) Select for other scene types randomly from remaining pool first,
		then get remaining from step 1

	120 uniques - 160 trials -> 40 objects repeated
"""

out_path = "./res/playlists_new.json"

items_per_class = {
	"bedroom": 30,
	"kitchen": 30,
	"livingroom": 30,
	"office": 30
}

best_playlists = None
best_loss = np.inf
best_iter = -1

n_trials = 160
n_unique_obj = 120
n_playlists = 150

n_swap = 5

full_generated = False

playlists = np.zeros([n_playlists, n_trials], dtype=int)

iter_ = 0
for _ in range( int(1e5) ):

	for iplaylist in range((n_swap if iter_ % 25 == 0 else 1) if full_generated else n_playlists):

		# We generate 150 playlists once, then change n_swap at a time and see if the loss improves
		if full_generated:
			print(f"\r{iplaylist+1} / {n_swap if iter_ % 25 == 0 else 1}", end="")
			iplaylist = np.random.randint(n_playlists)
			print(f" - {iplaylist}", end="")
		else:
			print(f"\r{iplaylist+1} / {n_playlists}", end="")

		playlist = (np.zeros([n_trials]) -1).astype(int)

		sel_weight = np.ones([n_unique_obj])
		selection = np.arange(n_unique_obj)

		# scene_order = np.arange(4)
		# np.random.shuffle(np.arange(4))

		for iScene in range(4):
			for iOwnType in range(25):
				# Assign 12 to first stimulus
				# Assign 13 to second stimulus

				val = np.random.choice(
					selection[iScene*30:(iScene+1)*30][sel_weight[iScene*30:(iScene+1)*30] > 0]
					)
				sel_weight[val] = 0

				if iOwnType < 12:
					playlist[iScene*40 +iOwnType] = val
				else:
					playlist[iScene*40 +8+iOwnType] = val

		for iScene in range(4):
			# Disqualify objects belonging to that scene type
			tmp_sel_weight = sel_weight.copy()
			tmp_sel_weight[iScene*30:(iScene+1)*30] = 0

			for iOtherTypes in range(15):
				# Assign 8 to scene i+0
				# Assign 7 to scene i+1

				# Reset sel_weight if all zeros
				try: # Try/except might be faster because Except will only happen once
					# Choose from remaining objects
					val = np.random.choice(
						selection[tmp_sel_weight > 0]
						)
				except:
					# print("RESET sel_weight")
					sel_weight[:] = 1
					tmp_sel_weight = sel_weight.copy()
					tmp_sel_weight[iScene*30:(iScene+1)*30] = 0

					val = np.random.choice(
						selection[tmp_sel_weight > 0]
						)

				tmp_sel_weight[val] = 0
				sel_weight[val] = 0

				if iOtherTypes < 8:
					playlist[iScene*40 +12+iOtherTypes] = val
				else:
					playlist[iScene*40 +33+(iOtherTypes-8)] = val

			# Randomise when done with scene type
			for istim in range(2):
				np.random.shuffle(
					playlist[iScene*40+istim*20: iScene*40+(istim+1)*20 ]
					)
		# Checks
		assert not np.any(playlist < -1),\
			"Any item can only appear twice maximum"

		assert not np.any(np.unique(playlist, return_counts=True)[1] > 2),\
			"Any item can only appear twice maximum"

		n_repeat = np.sum(np.unique(playlist, return_counts=True)[1] > 1)
		assert n_repeat == 40,\
			f"Exactly 40 items appear twice, found {n_repeat}"

		playlists[iplaylist] = playlist

	full_generated = True

	print(" "*20, end="")

	# print(general_count[0])

	# Compute loss
	# # 	Position of unique objects in playlist
	# general_count = np.zeros([n_trials, n_unique_obj], dtype=int)
	# for iplaylist in range(n_playlists):
	# 	general_count[np.arange(n_trials), playlists[iplaylist]] += 1

	# 	Count of unique objects as being in congruent and incongruent stimuli
	general_count = np.zeros([n_unique_obj, 3], dtype=int)
	for itrial in range(n_trials):
		val = np.nan

		nitrial = itrial % 20 # trial nb within scene stimuli
		witrial = itrial % 40 #  trial nb within scene type
		fitrial = witrial < 20 # is first stimuli of a scene type
		icitrial = (nitrial < 12 if fitrial else nitrial < 13) # assigned to congruent scene
		
		idx = np.nan
		if not icitrial:
			idx = 2
		else:
			idx = 0 if fitrial else 1

		# idx = 0

		uniques, count = np.unique(playlists[:, itrial], return_counts=True)

		general_count[uniques, idx] += count

	# NO SHUFFLING OF ALL FINAL RESULTS
	#	!! Stimuli order is shuffled in TrialData.js !!
	#		Participants place objects one scene after another

	# loss = np.linalg.norm(general_count.flatten())
	loss = general_count.std()

	print(f"\r[{iter_+1:>5}] {loss:.3f}", end="")

	if best_loss > loss:
		best_playlists = playlists.copy()
		print(" - new best!")
		best_loss = loss
		best_iter = iter_
	else:
		print(f" - best is {best_loss:.3f} (iter: {best_iter})") # newline

	iter_ += 1

with open(out_path, "w") as out_file:
	json.dump(playlists.tolist(), out_file)

out_file.close()
