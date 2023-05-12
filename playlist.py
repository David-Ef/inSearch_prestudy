#! /usr/bin/env python3
# ---------------------------------
# Author: Erwan DAVID <David@psych.uni-frankfurt.de>
# Year: 2023
# Lab: SGL, Goethe University, Frankfurt
# Comment: 
# ---------------------------------

import matplotlib.pyplot as plt
import numpy as np
import os, json


item_names = "alarm_clock", "bandaid", "battery", "belt", "business_card_holder", "candles", "card_game", "dollar_stack", "earphones", "extension_cords", "flashlight", "game_controller", "hand_lotion", "ice_cream_scoop", "laptop", "measuring_cups", "medication", "pants", "passport", "phone_charger", "pocket_knife", "printer_cartridges", "reading_glasses", "rubikscube", "screwdriver", "shoe_polish", "sketchbook", "sleep_mask", "sticky_notes", "tape_dispenser", "tupperware", "umbrella", "vr_headset", "whiteboard_markers"
scene_names = "bedroom", "kitchen", "livingroom", "office"

out_path = "./res/playlists.json"

n_unique_obj = 34
half_obj = n_unique_obj // 2
n_unique_scene = 4
n_trials = n_unique_obj * 4 
n_playlists = 40

# Subj, object, scene
playlists = np.empty([0, 121, 2], dtype=int)

for i_subj in range(n_playlists // 2 ):

	pl_user1 = np.empty([0, 2], dtype=int)
	pl_user2 = np.empty([0, 2], dtype=int)

	for i_scene in range(4):

		obj_pl = np.arange(n_unique_obj)

		if i_scene == 1:
			obj_pl = np.delete(obj_pl, [3, 4, 11, 17, 21, 23, 27, 29, 32])
		else:
			obj_pl = np.delete(obj_pl, [13, 15])
		
		# print(scene_names[i_scene], *[item_names[i_o] for i_o in  [13, 15] ])

		n_obj = obj_pl.shape[0]

		# np.random.shuffle(obj_pl)

		# Add i_o and i_s
		tmp_1 = np.concatenate([
			obj_pl[:, None],
			np.array([*[i_scene*2]*(n_obj//2), *[i_scene*2+1]*int(np.ceil(n_obj/2))])[:, None]
							], axis=1)

		pl_user1 = np.concatenate([pl_user1, tmp_1], axis=0)

		tmp_2 = np.concatenate([
			obj_pl[:, None],
			np.array([*[i_scene*2+1]*(n_obj//2), *[i_scene*2]*int(np.ceil(n_obj/2))])[:, None]
							], axis=1)

		pl_user2 = np.concatenate([pl_user2, tmp_2], axis=0)

	# shuffle playlist so scenes are shuffled too
	# np.random.shuffle(pl_user1)
	# np.random.shuffle(pl_user2)
	
	playlists = np.concatenate([playlists, pl_user1[None,:,:]], axis=0)
	playlists = np.concatenate([playlists, pl_user2[None,:,:]], axis=0)

print(playlists.shape)

with open(out_path, "w") as out_file:
	json.dump(playlists.tolist(), out_file)

out_file.close()
