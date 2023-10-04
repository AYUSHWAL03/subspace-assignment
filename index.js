require('dotenv').config();

const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const app = express();

async function fetchAPI(){

    const response = await axios.get(process.env.URL ,{
    headers:{
            "x-hasura-admin-secret": process.env.ADMIN_SECRET_KEY 
        }
    });

    return response.data;
}
    const memoizedResponse = _.memoize(fetchAPI); // memoize response to cache memory storing
app.get('/api/blog-stats',async (req,res)=>{
    try {
        
        
    // res.json(response.data); // showing response data to frontend

    const simpleblogData = await memoizedResponse();
    const blogData = simpleblogData.blogs;

    // // const totalBlogs = blogData.length; //normal approach
    const totalBlogs = _.get(simpleblogData,'blogs.length',0); // using lodash
    
    const MaxBlogtitles = _.maxBy(blogData,(blog)=>blog.title.length);
    var keyword = "privacy" //change the value to anything that will return the title contain keywords accordingly
    const titleContainskeyword = _.filter(blogData,(blog)=>{
        return blog.title.toLowerCase().includes(keyword.toLowerCase());
    });
    
    const titleArray = _.uniqBy(blogData,(blog)=>{
        return blog.title.toLowerCase()
    })
    const uniqueTitleArray = titleArray.map((blog)=>{
        return blog.title.toLowerCase();//to return the title only from titleArray
    })
    
    
    const newResponse = {
        "Number of blogs" : totalBlogs,
        "Longest blog title" : MaxBlogtitles.title,
        "Blogs with title privacy" : titleContainskeyword.length,
        "unique title blogs" : uniqueTitleArray
    }
    
    console.log(uniqueTitleArray.length)//printing the number of unique title to state the difference 
    // console.log(blogData)
    res.json(newResponse);
    
    } 
    catch (error) {
        console.log(error)
        res.status(400).send("Internal Server Error: " + error.message)
    }
})


    app.get('/api/blog-search',async (req,res)=>{
        try {
            
            const query = req.query.query;
            
        
            const response = await memoizedResponse();
            const blogData = response.blogs;
            var keyword = query || "privacy";
            const titleContainskeyword = _.filter(blogData,(blog)=>{
                return blog.title.toLowerCase().includes(keyword);
            });
            res.json(titleContainskeyword)
        } catch (error) {
            console.log("internal error: " + error.message)
            res.send("internal error: " + error.message)
        }
    })

app.listen(3000,()=>{
    console.log(`listening on port http://localhost:3000 `);
})