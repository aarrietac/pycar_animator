'''
Script that creates a javascript file  to define the global varibles to be used
on the animation.
'''

file = 'animation_global_variables.js'
f = open(file, 'w')

# vehicle geometric parameters
track_with = 1.5
wheel_base = 3.0
wheel_radius = 0.34

f.write('// Vehicle geometric parameters\n')
f.write('var track_with = ' + str(track_with) + ';\n')
f.write('var wheel_base = ' + str(wheel_base) + ';\n')
f.write('var wheel_radius = ' + str(wheel_radius) + ';\n\n')

# road geometric parameters
xc_a = 120.0
yc_a = 0.0
l_area = 300.0
w_area = 5.5
f.write('// Road geometric parameters\n')
f.write('var xc_a = ' + str(xc_a) + ';\n')
f.write('var yc_a = ' + str(yc_a) + ';\n')
f.write('var l_area = ' + str(l_area) + ';\n')
f.write('var w_area = ' + str(w_area) + ';\n\n')

# obstacle geometric parameters
obs_xc = 150.0
obs_yc = 0.0
obs_z = 2.5
f.write('// Obstacle geometric parameters\n')
f.write('var obs_xc = ' + str(obs_xc) + ';\n')
f.write('var obs_yc = ' + str(obs_yc) + ';\n')
f.write('var obs_z = ' + str(obs_z) + ';')

f.close()
