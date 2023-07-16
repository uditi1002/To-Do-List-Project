import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import _ from 'lodash';
import dotenv from 'dotenv';

dotenv.config({path: "secrets.env"});
const app =  express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

mongoose.connect(process.env.key);

const tasksSchema = {
    task : {
        type: String,
        required:['true', 'you need to have a task dude']
    }
}

const Item = mongoose.model("Task", tasksSchema);

const task = new Item({
    task: "Keep hydrating"
});

//task.save();

const listSchema = {
    name: String,
    items: [tasksSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", async(req, res) => {

    Item.find().exec()
    .then(tasks => {
        res.render("list", {listTitle: "Today", newListItems: tasks});
    })
    .catch(err => {console.log(err);});

});

app.post("/", function(req, res) {

    const task = new Item({
        task: req.body.newItem
    })

    const title = req.body.list;

    if (title === "Today"){
        task.save()
        .then(
            res.redirect("/")
        );
    } else {
        List.findOne({name: title}).then(found => {
            found.items.push(task);
            found.save()
            .then(
            res.redirect("/"+title)
            )
        });
    }

});

app.post("/delete", async (req, res) => {

    const checkedItemId = req.body.checkbox;
    const title = req.body.list;

    if (title === "Today"){
        Item.deleteOne({_id: req.body.checkbox})
        .then(
            res.redirect("/")
        )
        .catch(err => {console.log(err)}
        )
    } else {
        List.findOneAndUpdate({name: title}, {$pull: {items: {_id: checkedItemId}}})
        .then(
            res.redirect("/"+title)
            )
    }  
    
});

app.get("/:category", async (req, res) => {

    const category = _.capitalize(req.params.category);

    List.findOne({name: category}).then(found => {
        if (found){
            res.render("list", {listTitle: category, newListItems: found.items});
        } else {
            const list = new List({
                name: category,
                items: []
            });

            list.save()
            .then(res.redirect("/lists/"+category));
        }
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});