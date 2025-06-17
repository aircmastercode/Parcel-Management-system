module.exports = (sequelize, DataTypes) => {
  const Parcel = sequelize.define('Parcel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sender_station_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiver_station_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tracking_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_transit', 'delivered', 'returned', 'lost'),
      defaultValue: 'pending'
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sender_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiver_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sender_contact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    receiver_contact: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'parcels',
    timestamps: true
  });

  Parcel.associate = (models) => {
    Parcel.belongsTo(models.Station, {
      foreignKey: 'sender_station_id',
      as: 'senderStation'
    });
    
    Parcel.belongsTo(models.Station, {
      foreignKey: 'receiver_station_id',
      as: 'receiverStation'
    });
    
    Parcel.hasMany(models.Message, {
      foreignKey: 'parcel_id',
      as: 'messages'
    });
  };

  return Parcel;
}; 