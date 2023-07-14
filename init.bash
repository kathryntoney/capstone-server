sequelize model:generate --name users --attributes name:string,email:string,profilePic:string

sequelize model:generate --name favorites --attributes userID:integer,picture:string,notes:string