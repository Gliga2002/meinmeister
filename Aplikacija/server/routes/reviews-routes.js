const router = require('express').Router();
const {check} = require('express-validator');

const checkAuth = require('../middlewares/check-auth')
const reviewControllers = require('../controllers/reviews-controllers')

router.get('/all/:postId',reviewControllers.getReviewsByPostId);

router.get('/average/:postId',reviewControllers.getReviewsAverage);

router.get('/:reviewId', reviewControllers.getReviewByUserId);

router.use(checkAuth);

router.post('/postId/:postId',
[
  check('star').isFloat({min:1, max:5}),
  check('reviewText').trim().not().isEmpty().isLength({min:5})
],
reviewControllers.postReviewByPostId);

router.patch('/id/:reviewId/post/:postId',
[
  check('star').isFloat({min:1, max:5}),
  check('reviewText').trim().not().isEmpty().isLength({min:5})
]
,reviewControllers.patchReviewByPostId)

router.delete('/:reviewId',reviewControllers.deleteReviewByPostId); 


module.exports = router;