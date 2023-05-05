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


out_path = "./res/playlists.json"

best_playlists = None
best_loss = np.inf
best_iter = -1

n_unique_obj = 34
half_obj = n_unique_obj // 2
n_unique_scene = 4
n_trials = n_unique_obj * 4 
n_playlists = 40

# Subj, object, scene
playlists = np.ones([n_playlists, n_trials, 2], dtype=int) * -1

for i_subj in range(n_playlists // 2 ):
	for i_scene in range(4):

		# Randomise object list for that scene type
		#	For subj i show first 17 obj in scene a and the 17 others in scene b
		#	For subj 2 show first 17 obj in scene b and the 17 others in scene a
		# Thus we get the same presentation time per object and scene exemplar

		obj = np.arange(n_unique_obj)
		np.random.shuffle(obj)

		playlists[i_subj*2, n_unique_obj*i_scene:n_unique_obj*(i_scene+1), 0] = obj
		playlists[i_subj*2, n_unique_obj*i_scene:n_unique_obj*(i_scene+1), 1] = np.repeat([i_scene*2, i_scene*2+1], half_obj).flatten()

		playlists[i_subj*2+1, n_unique_obj*i_scene:n_unique_obj*(i_scene+1), 0] = obj
		playlists[i_subj*2+1, n_unique_obj*i_scene:n_unique_obj*(i_scene+1), 1] = np.repeat([i_scene*2+1, i_scene*2], half_obj).flatten()

	# shuffle playlist so scenes are shuffled too
	np.random.shuffle(playlists[i_subj*2])
	np.random.shuffle(playlists[i_subj*2+1])

with open(out_path, "w") as out_file:
	json.dump(playlists.tolist(), out_file)

out_file.close()
