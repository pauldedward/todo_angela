
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-user:abcd1234@cluster0.hyqg9.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const itemScema = {
    name:{
        type:String,
        required:[true,"Enter task"]
    }
};
const Item = mongoose.model("item",itemScema);

const listScema = {
    name : {
        type : String,
        required:[true,"Enter list"]
    },
    items : [itemScema]
}

const List = mongoose.model("list",listScema);

app.get("/", function(req,res)
{
    var items = Item.find({},function(err, items){

        if(err)
        {
            console.log(err);
        } else
        {
            console.log(items);
            const day = date.getDate();
            res.render("list",{kindOfDay:day,listItems:items});
        }
    });

})

app.get("/:customListName", function(req, res){

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err, foundList){

        if(!err)
        {
            if(!foundList)
            {
                const list = new List ({
                    name : customListName,
                    item : [{name:customListName, items:[]}]
                });
                list.save();
                res.redirect("/" + customListName);
            } else
            {
                res.render("list",{kindOfDay:foundList.name,listItems:foundList.items})
            }
        }
    });
});

app.post("/",function(req, res)
{
    const task = { name : req.body.listItem };
    const job = req.body.listItem;
    const listName = req.body.listName;
    const day = date.getDate();

    if(listName === day)
    {
        const item = new Item({name:job});
        item.save();
        res.redirect("/");
    } else
    {
        List.findOne({name : listName}, function(err, foundList)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                foundList.items.push(task);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }

});

app.post("/delete",function(req, res)
{
    const checkedItemId = req.body.checkBox;
    const listName = req.body.hiddenInput;
    const day = date.getDate();

    if (day === listName)
    {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err)
            {
                console.log(err);
            }
            else {
                console.log("Deleted");
            }
            res.redirect("/");
        });

    } else
    {
        List.findOneAndUpdate({ name:listName }, {$pull : {items: { _id: checkedItemId }}}, function(err)
        {
            if(!err)
            {
                res.redirect("/" + listName);
            }
            else
            {
                console.log(err);
            }
        });
    }

})


app.listen(process.env.PORT || 3000, function()
{
    console.log("up and running");
})
