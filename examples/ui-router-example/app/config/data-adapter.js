app.config(function (DSFirebaseAdapterProvider, DSProvider) {
		var basePath = 'https://bcw-js-data.firebaseio.com/';
		DSFirebaseAdapterProvider.defaults.basePath = basePath;

		angular.extend(DSProvider.defaults, {
			beforeCreate: function (resource, data, cb) {
				if (resource.defaultAdapter === 'firebase') {
					data = fixKeys(data, true);
				}
				cb(null, data);
			},
			beforeUpdate: function (resource, data, cb) {
				if (resource.defaultAdapter === 'firebase') {
					data = fixKeys(data, true);
				}
				cb(null, data);
			},
			afterCreate: function (resource, data, cb) {
				if (resource.defaultAdapter === 'firebase') {
					data = fixKeys(data, false);
				}
				cb(null, data);
			},
			afterUpdate: function (resource, data, cb) {
				if (resource.defaultAdapter === 'firebase') {
					data = fixKeys(data, false);
				}
				cb(null, data);
			},
			afterFind: function (resource, data, cb) {
				if (resource.defaultAdapter === 'firebase') {
					data = fixKeys(data, false);
				}
				cb(null, data);
			},
			afterFindAll: function (resource, data, cb) {
				if (resource.defaultAdapter === 'firebase') {
					if (!Array.isArray(data)) {
						data = fixKeys(data, false);
					} else {
						data = data.map(function (d) {
							return fixKeys(d, false);
						})
					}
				}
				cb(null, data);
			},
		});

});

app.run(function (DS, DSFirebaseAdapter, User) {
	// js-data-angular created a new store
	// automatically and registered it as DS.
	// The firebase adapter was already registered,
	// but we want to make it the default.
	DS.registerAdapter(
		'firebase',
		DSFirebaseAdapter,
		{ default: true }
    );

	// Activate a mostly auto-sync with Firebase
	// The only thing missing is auto-sync TO Firebase
	// This will be easier with js-data 2.x, but right
	// now you still have to do DS.update('user', 1, { foo: 'bar' }), etc.
	angular.forEach(DS.definitions, function (Resource) {
				if (Resource.defaultAdapter !== 'firebase') return;
				var ref = DSFirebaseAdapter.ref.child(Resource.endpoint);
				// Inject items into the store when they're added to Firebase
				// Update items in the store when they're modified in Firebase
				ref.on('child_changed', function (dataSnapshot) {
			var data = dataSnapshot.val();
			if (data[Resource.idAttribute]) {
				Resource.inject(fixKeys(data));
			}
				});
				// Eject items from the store when they're removed from Firebase
				ref.on('child_removed', function (dataSnapshot) {
			var data = dataSnapshot.val();
			if (data[Resource.idAttribute]) {
				Resource.eject(data[Resource.idAttribute]);
			}
		});
	});
});

function fixKeys(obj, encode) {
		if (!Array.isArray(obj) && typeof obj != 'object') return obj;
		return Object.keys(obj).reduce(function (acc, key) {
			var fixedKey = key;
			if (encode) {
				fixedKey = encodeAsFirebaseKey(fixedKey);
			} else {
				fixedKey = decodeFirebaseKey(fixedKey);
			}
			acc[fixedKey] = fixKeys(obj[key], encode);
			return acc;
		}, Array.isArray(obj) ? [] : {});
	}

	function encodeAsFirebaseKey(val) {
		return val
			.replace(/\%/g, '%25')
			.replace(/\./g, '%2E')
			.replace(/\#/g, '%23')
			.replace(/\$/g, '%24')
			.replace(/\//g, '%2F')
			.replace(/\[/g, '%5B')
			.replace(/\]/g, '%5D');
	};

	function decodeFirebaseKey(val) {
		return val
			.replace(/\%25/g, '%')
			.replace(/\%2E/g, '.')
			.replace(/\%23/g, '#')
			.replace(/\%24/g, '$')
			.replace(/\%2F/g, '/')
			.replace(/\%5D/g, ']')
			.replace(/\%5B/g, '[')
	};