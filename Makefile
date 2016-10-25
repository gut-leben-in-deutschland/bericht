SHELL := /bin/bash

-include .env

CLI_IXT_BLUE = \033[38;5;67m
CLI_SUCCESS  = \033[1;32m✔
CLI_ERROR    = \033[1;31m✘
CLI_NOTICE   = \033[1;36m→
CLI_RESET    = \033[0m

DEPLOY_STAGING_CMD := rsync -avz --delete --exclude-from=.rsyncexclude ./build/ $(STAGING_DESTINATION_PATH)
DEPLOY_STAGING_URL := $(STAGING_PUBLIC_URL)
DEPLOY_PRODUCTION_CMD := rsync -avz --delete --exclude-from=.rsyncexclude ./build/ $(PRODUCTION_DESTINATION_PATH)
DEPLOY_PRODUCTION_URL := $(PRODUCTION_PUBLIC_URL)

#
# Standard targets
#

.PHONY: all install setup update server build build-test dist deploy test clean clobber charts charts-publish topojson geodata

all: server

install: node_modules

setup: install
	@echo "No environment setup is required in this project"

update: install
	@echo "No environment update is required in this project"

server: install
	@env=development $$(npm bin)/nodemon -q --watch script/server.js --watch webpack.config.js script/server.js

build: clean install
	@env=$(env) $$(npm bin)/webpack --colors --progress

build-test: clean install
	@env=test $$(npm bin)/webpack --colors --progress

build.zip: build
	zip -re $@ build

dist: build
	@script/dist

deploy: build
	@echo -e "$(CLI_NOTICE) Starting deployment ...$(CLI_RESET)"
ifeq ($(env),staging)
	$(DEPLOY_STAGING_CMD)
	@echo -e "$(CLI_SUCCESS) Deployed to $(DEPLOY_STAGING_URL)$(CLI_RESET)"
else ifeq ($(env),production-test)
	$(DEPLOY_PRODUCTION_CMD)
	@echo -e "$(CLI_SUCCESS) Deployed to $(DEPLOY_PRODUCTION_URL)$(CLI_RESET)"
else
	@echo -e "$(CLI_ERROR) Don't know how to deploy to $(env)"
endif

charts:
	@env=phantom node script/charts.js --id=$(id) --type=$(type) --locale=$(locale)

indicators-overview:
	$$(npm bin)/babel-node script/indicators-overview.js

charts-publish:
	@echo -e "Uploading charts-output"
	@rsync -avz --exclude-from=.rsyncexclude \
		./assets/charts-de/ \
		$(CHARTS_OUTPUT_DESTINATION_PATH)
	@rsync -avz --exclude-from=.rsyncexclude \
		./assets/charts-en/ \
		$(CHARTS_OUTPUT_DESTINATION_PATH)/en

geobase/vg250_2016-01-01.utm32s.shape.ebenen.zip:
	curl http://www.geodatenzentrum.de/auftrag1/archiv/vektor/vg250_ebenen/2016/vg250_2016-01-01.utm32s.shape.ebenen.zip -o $@

geobase/vg250_2016-01-01.utm32s.shape.ebenen: geobase/vg250_2016-01-01.utm32s.shape.ebenen.zip
	unzip -o -d $(dir $@) $@.zip

geobase/vg250_2015-12-31.utm32w.shape.ebenen.zip:
	curl http://www.geodatenzentrum.de/auftrag1/archiv/vektor/vg250_ebenen/2015/vg250_2015-12-31.utm32w.shape.ebenen.zip -o $@

geobase/vg250_2015-12-31.utm32w.shape.ebenen: geobase/vg250_2015-12-31.utm32w.shape.ebenen.zip
	unzip -o -d $(dir $@) $@.zip

geobase/vg250_2015-12-31.utm32s.shape.ebenen.zip:
	curl http://www.geodatenzentrum.de/auftrag1/archiv/vektor/vg250_ebenen/2015/vg250_2015-12-31.utm32s.shape.ebenen.zip -o $@

geobase/vg250_2015-12-31.utm32s.shape.ebenen: geobase/vg250_2015-12-31.utm32s.shape.ebenen.zip
	unzip -o -d $(dir $@) $@.zip

geobase/vg250_2014-01-01.utm32s.shape.ebenen.zip:
	curl http://www.geodatenzentrum.de/auftrag1/archiv/vektor/vg250_ebenen/2014/vg250_2014-01-01.utm32s.shape.ebenen.zip -o $@

geobase/vg250_2014-01-01.utm32s.shape.ebenen: geobase/vg250_2014-01-01.utm32s.shape.ebenen.zip
	unzip -o -d $(dir $@) $@.zip
	mv geobase/vg250_0101.utm32s.shape.ebenen $@

geobase/krs-mpidr-396.geojson:
	ogr2ogr -f GeoJSON -t_srs crs:84 -dialect sqlite -sql "\
			SELECT \
				shape.AGS_num AS RS, \
				csv.name AS GEN, \
				shape.geometry AS geometry \
			FROM 'MPIDR_Lebenserwartung_regional_WGS84_UTF-8' AS shape \
				LEFT JOIN 'src/data/krs-names.csv'.'krs-names' AS csv ON csv.id = shape.AGS_num AND csv.ds = 'mpidr-396'" \
		$@ \
		geobase/4647_main_MPIDR_Lebenserwartung_regional_SHAPE_MODIFIED/MPIDR_Lebenserwartung_regional_WGS84_UTF-8.shp

geobase/krs-2014.geojson: geobase/vg250_2014-01-01.utm32s.shape.ebenen
	ogr2ogr -f GeoJSON -t_srs crs:84 -dialect sqlite -sql "\
			SELECT \
				CAST(CAST(shape.RS as int) as text) AS RS, \
				csv.name AS GEN, \
				shape.geometry AS geometry \
			FROM VG250_KRS AS shape \
				LEFT JOIN 'src/data/krs-names.csv'.'krs-names' AS csv ON csv.id = CAST(CAST(shape.RS as int) as text) AND csv.ds = '2014' \
			WHERE shape.GF != 2" \
		$@ \
		geobase/vg250_2014-01-01.utm32s.shape.ebenen/vg250_ebenen/VG250_KRS.shp

geobase/krs-2015.geojson: geobase/vg250_2015-12-31.utm32w.shape.ebenen
	ogr2ogr -f GeoJSON -t_srs crs:84 -dialect sqlite -sql "\
			SELECT \
				CAST(CAST(shape.RS as int) as text) AS RS, \
				csv.name AS GEN, \
				shape.geometry AS geometry \
			FROM VG250_KRS AS shape \
				LEFT JOIN 'src/data/krs-names.csv'.'krs-names' AS csv ON csv.id = CAST(CAST(shape.RS as int) as text) AND csv.ds = '2015' \
			WHERE shape.GF != 2" \
		$@ \
		geobase/vg250_2015-12-31.utm32w.shape.ebenen/vg250_ebenen/VG250_KRS.shp

geobase/kreg-2014.geojson:
	ogr2ogr -f GeoJSON -t_srs crs:84 \
		$@ \
		geobase/BBSR_Kreisregionen2014/Kreisregionen1214.shp

geobase/germany.geojson: geobase/vg250_2015-12-31.utm32s.shape.ebenen
	ogr2ogr -f GeoJSON -t_srs crs:84 -where "GF = 4" \
		$@ \
		geobase/vg250_2015-12-31.utm32s.shape.ebenen/vg250_ebenen/VG250_STA.shp

geobase/states.geojson: geobase/vg250_2015-12-31.utm32s.shape.ebenen
	ogr2ogr -f GeoJSON -t_srs crs:84 -where "GF = 4" \
		$@ \
		geobase/vg250_2015-12-31.utm32s.shape.ebenen/vg250_ebenen/VG250_LAN.shp

geodata: geobase/vg250_2016-01-01.utm32s.shape.ebenen
	ogr2ogr -f CSV -t_srs crs:84 -dialect sqlite -sql "SELECT \
				AGS AS id, GEN AS name, \
				ST_X(ST_Transform(ST_Centroid(geometry), 4326)) AS lon, \
				ST_Y(ST_Transform(ST_Centroid(geometry), 4326)) AS lat \
			FROM VG250_GEM \
			WHERE GF != 2" \
		/dev/stdout \
		geobase/vg250_2016-01-01.utm32s.shape.ebenen/vg250_ebenen/VG250_GEM.shp \
	  | $$(npm bin)/babel-node script/municipalities-no2.js > src/data/municipalities.csv

krsnames: geobase/vg250_2015-12-31.utm32w.shape.ebenen geobase/vg250_2014-01-01.utm32s.shape.ebenen
	( \
		ogr2ogr -f CSV -t_srs crs:84 -dialect sqlite -sql "SELECT \
				'mpidr-396' AS ds, \
				AGS_num AS id, \
				'' AS plainName, \
				Kreis AS name \
			FROM 'MPIDR_Lebenserwartung_regional_WGS84_UTF-8'" \
		/dev/stdout \
		geobase/4647_main_MPIDR_Lebenserwartung_regional_SHAPE_MODIFIED/MPIDR_Lebenserwartung_regional_WGS84_UTF-8.shp \
		&& \
		ogr2ogr -f CSV -t_srs crs:84 -dialect sqlite -sql "SELECT \
				'2015' AS ds, \
				AGS * 1 AS id, \
				GEN AS plainName, \
				GEN || ' (' || BEZ || ')' AS name \
			FROM VG250_KRS \
			WHERE GF != 2" \
		/dev/stdout \
		geobase/vg250_2015-12-31.utm32w.shape.ebenen/vg250_ebenen/VG250_KRS.shp \
		&& \
		ogr2ogr -f CSV -t_srs crs:84 -dialect sqlite -sql "SELECT \
				'2014' AS ds, \
				AGS * 1 AS id, \
				GEN AS plainName, \
				GEN || ' (' || BEZ || ')' AS name \
			FROM VG250_KRS \
			WHERE GF != 2" \
		/dev/stdout \
		geobase/vg250_2014-01-01.utm32s.shape.ebenen/vg250_ebenen/VG250_KRS.shp \
	) | \
	$$(npm bin)/babel-node script/clean-krs-names.js > src/data/krs-names.csv

topojson: geobase/kreg-2014.geojson geobase/krs-mpidr-396.geojson geobase/krs-2014.geojson geobase/krs-2015.geojson geobase/germany.geojson geobase/states.geojson
	$$(npm bin)/topojson -o src/data/kreg-2014.json --id-property KREG1214 -p name=NAME -- geobase/kreg-2014.geojson

	$$(npm bin)/topojson -o src/data/krs.json --id-property +RS -p name=GEN -s 7e-8 --filter=small -- \
		geobase/krs-mpidr-396.geojson \
		geobase/krs-2014.geojson \
		geobase/krs-2015.geojson

	$$(npm bin)/topojson -o src/data/germany.json --id-property GEN -s 7e-8 -- \
		geobase/germany.geojson \
		geobase/states.geojson

bundle-size:
	@echo -e "$(CLI_NOTICE) Sizes are not minified$(CLI_RESET)"
	@env=production $$(npm bin)/webpack --progress --json | $$(npm bin)/webpack-bundle-size-analyzer

a11y:
	@$$(npm bin)/babel-node script/a11y.js --url=$(url) --path=$(path)

test: lint build-test
	@$$(npm bin)/babel-node script/a11y.js --path=./build-test

clean:
	rm -rf build build-test build.zip

clobber:
	git clean -dfx


#
# Supporting targets
#

lint:
	@$$(npm bin)/eslint src
	@$$(npm bin)/eslint cabinet

node_modules: package.json
	@npm install
	@touch $@
