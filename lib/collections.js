// documents collection
this.Documents = new Mongo.Collection("documents");
// editing users collection
EditingUsers = new Mongo.Collection("editingUsers");

//COmments Collection
Comments = new Mongo.Collection("comments");
Comments.attachSchema(new SimpleSchema({
	title:{
		type:String,
		label:"Ttile",
		max:200
	},
	body:{
		type:String,
		label:"Comment",
		max:1000
	},
	docid:{
		type:String,
	},
	owner:{
		type:String,
	},
}));
//this lib folder is delth first so we are putting our collection initiation here, so collections are ready att he begining
