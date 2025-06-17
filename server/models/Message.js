module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    from_station: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    to_station: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parcel_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_master_copied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'messages',
    timestamps: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Station, {
      foreignKey: 'from_station',
      as: 'sender'
    });
    
    Message.belongsTo(models.Station, {
      foreignKey: 'to_station',
      as: 'receiver'
    });
    
    Message.belongsTo(models.Parcel, {
      foreignKey: 'parcel_id',
      as: 'parcel'
    });
  };

  return Message;
}; 