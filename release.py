import os
import zipfile
import json

data = json.load( open( 'manifest.json' ) )
version = data[ 'version' ].replace( '.', '-' )
zipFileName = '../mimic-octopus-v-' + version + '.zip'

releaseignore = [];

file = open( '.releaseignore', "r" )
for line in file:
    releaseignore.append( line.replace( "\n", "") )

zipf = zipfile.ZipFile( zipFileName, 'w', zipfile.ZIP_DEFLATED )

for root, dirs, files in os.walk('./'):
    for file in files:
        if file not in releaseignore:
            zipf.write( os.path.join( root, file ) )

zipf.close()
