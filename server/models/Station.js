module.exports = (sequelize, DataTypes) => {
  const Station = sequelize.define('Station', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_master: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'stations',
    timestamps: true
  });

  Station.associate = (models) => {
    Station.hasMany(models.User, {
      foreignKey: 'station_id',
      as: 'users'
    });
    
    Station.hasMany(models.Parcel, {
      foreignKey: 'sender_station_id',
      as: 'sentParcels'
    });
    
    Station.hasMany(models.Parcel, {
      foreignKey: 'receiver_station_id',
      as: 'receivedParcels'
    });
    
    Station.hasMany(models.Message, {
      foreignKey: 'from_station',
      as: 'sentMessages'
    });
    
    Station.hasMany(models.Message, {
      foreignKey: 'to_station',
      as: 'receivedMessages'
    });
  };

  return Station;
}; 