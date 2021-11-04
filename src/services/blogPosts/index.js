import express from "express"
import blogPostModel from "./schema.js"
import CommentModel from "../comments/schema.js"
import createHttpError from "http-errors"
import q2m from "query-to-mongo"
import { basicAuthMiddleware } from "../../auth/basic.js";

const blogPostsRouter = express.Router()

// blogPostsRouter.get("/", async (req,res,next)=>{
//     try {
//         const blogPosts = await blogPostModel.find({})
//         res.send(blogPosts)
//     } catch (error) {
//         next(error)
//     }
// })

blogPostsRouter.get('/', async (req, res, next) => {
	try {
		const mongoQuery = q2m(req.query);
		const total = await blogPostModel.countDocuments(mongoQuery.criteria);
		const blogs = await blogPostModel.find(
			mongoQuery.criteria,
			mongoQuery.options.fields,
		)
			.limit(mongoQuery.options.limit || 10)
			.skip(mongoQuery.options.skip)
			.sort(mongoQuery.options.sort)
      .populate({path: "authors", select: "name surname email"})
		res.send({
			// links: mongoQuery.links('/blogs', total),
			// total,
			// pageTotal: Math.ceil(total / mongoQuery.options.limit),
			blogs,
		});
	} catch (error) {
		next(error);
	}
});

blogPostsRouter.get("/:blogPostId", async (req,res,next)=>{
    try {
        const paramsID = req.params.blogPostId
        const blogPost = await blogPostModel.findById(paramsID)
        if (blogPost) {
            res.send(blogPost)
        } else {
            next(createHttpError(404, `User with id ${paramsID} not found`))
        }
    } catch (error) {
         next(error)
    }
})

blogPostsRouter.post("/", async (req,res,next)=>{
    try {
        const newBlogPost = new blogPostModel(req.body)
        const { _id } = await newBlogPost.save()
        res.status(201).send({ _id })
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.put("/:blogPostId",basicAuthMiddleware, async (req,res,next)=>{
    try {
        const paramsID = req.params.blogPostId
        const upBlogPost = await blogPostModel.findByIdAndUpdate(paramsID, req.body, {new: true})
        if (upBlogPost) {
            res.send(upBlogPost)
        } else {
            next(createHttpError(404, `User with id ${paramsID} not found`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.delete("/:blogPostId",basicAuthMiddleware, async (req,res,next)=>{
    try {
        const paramsID = req.params.blogPostId
        const delBlogPost = await blogPostModel.findByIdAndDelete(paramsID)
        if (delBlogPost) {
            res.status(204).send()
        } else {
            next(createHttpError(404, `User with id ${paramsID} not found`))
        }
    } catch (error) {
        next(error)
    }
})



//  blogPosts comments CRUD


blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
	try {
        const paramsID = req.params.blogPostId
		    const Isblog = await blogPostModel.findById(paramsID);
		if (Isblog) {
			const newComment=new CommentModel(req.body)
            const commentToInsert={...newComment.toObject(), commentedOn: new Date(),}
            const updatedPost=await blogPostModel.findByIdAndUpdate(
				paramsID, // WHO we want modify
				{ $push: { comments: commentToInsert } }, // HOW we want to modify
				{ new: true }, // options
			);
			res.status(201).send(updatedPost);
		} else {
			next(createHttpError(404, `blog with id ${paramsID} not found!`),);
		}
	} catch (error) {
		next(error);
	}
})
  
  blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
    try {
        const paramsID = req.params.blogPostId
        const blogPost = await blogPostModel.findById(paramsID)
        if (blogPost) {
          res.send(blogPost.comments)
        } else {
          next(`BlogPost with id ${paramsID} not found!`)
        }
    } catch (error) {
      next(error)
    }
  })
  
  blogPostsRouter.get("/:blogPostId/comments/:commentId", async (req, res, next) => {
    try {
        const paramsID = req.params.blogPostId
        const blogPost = await blogPostModel.findById(paramsID)
        if (blogPost) {
            const comment = blogPost.comments.find(c => c._id.toString() === req.params.commentId)
            if (comment) {
                res.send(comment)
              } else {
                next(`Comment with id ${req.params.commentId} not found in comments!`)
              }
            } else {
              next(`BlogPost with id ${paramsID} not found!`)
            }
    } catch (error) {
      next(error)
    }
  })
  
  blogPostsRouter.put("/:blogPostId/comment/:commentId", async (req, res, next) => {
try {
    const paramsID = req.params.blogPostId
    const post =await blogPostModel.findById(paramsID)
     if(post){
            const index=post.comments.findIndex(c=>c._id.toString()===req.params.commentId)
            if(index!==-1){
                post.comments[index] = {...post.comments[index].toObject(),...req.body}
                await post.save()
                res.send(post)
            }else{
                next(createHttpError(404, `Comment with id${req.params.commentId} not found!`))
            }
        }else{
            next(createHttpError(404, `BlogPost with id${paramsID} not found!`))
        }
    } catch (error) {
     next(error)
}
  })
//     try {
//         const blogPost = await blogPostModel.findOneAndUpdate(
//             { _id: req.params.blogPostId, "comments._id": req.params.commentId },
//             { $set: { "comments.$": req.body } },
//             { new: true }
//           )
//           if (blogPost) {
//             res.send(blogPost)
//           } else {
//             next(`BlogPost with id ${req.params.blogPostId} not found!`)
//           }
//     } catch (error) {
//       next(error)
//     }
//   })
  
  blogPostsRouter.delete("/:blogPostId/comment/:commentId", async (req, res, next) => {
    try {
        const paramsID = req.params.blogPostId
        const blogPost = await blogPostModel.findByIdAndUpdate(
        paramsID, 
        {$pull: {comments: { _id: req.params.commentId },},},
        { new: true,})
          if (blogPost) {
            res.status(204).send(blogPost)
          } else {
            next(`BlogPost with id ${paramsID} not found!`)
          }
    } catch (error) {
      next(error)
    }
  })


export default blogPostsRouter