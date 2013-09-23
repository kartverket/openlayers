./buildUncompressed.py
java -jar compiler.jar --js OpenLayers.js --js_output_file openlayers.min.js || exit 1
mv openlayers.min.js OpenLayers.js
