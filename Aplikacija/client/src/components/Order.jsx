import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import { Link } from 'react-router-dom';

const Order = () => {
  const [items, setItems] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const userId = currentUser.userId;
        let mergedItems = [];

        if (currentUser.isMeister) {
          const workerIdResponse = await axios.get(`http://localhost:5000/api/workers/userId/${userId}`);
          const workerId = workerIdResponse.data._id;

          const workerOrdersResponse = await axios.get(`http://localhost:5000/api/orders/worker/${workerId}`, config);
          const workerOrders = workerOrdersResponse.data;

          const userOrdersResponse = await axios.get(`http://localhost:5000/api/orders/user/${userId}`, config);
          const userOrders = userOrdersResponse.data;

          mergedItems = [
            ...workerOrders.map((order) => ({ ...order, type: 'order' })),
            ...userOrders.map((notification) => ({ ...notification, type: 'notification' })),
          ];
        } else {
          const userOrdersResponse = await axios.get(`http://localhost:5000/api/orders/user/${userId}`, config);
          mergedItems = userOrdersResponse.data.map((notification) => ({ ...notification, type: 'notification' }));
        }

        const sortedItems = mergedItems.sort((a, b) => {
          const dateA = new Date(a.scheduledDate);
          const dateB = new Date(b.scheduledDate);
          return dateA - dateB;
        });

        setItems(sortedItems);
      } catch (err) {
        console.log(err);
      }
    };

    fetchOrderData();
  }, [currentUser]);

  const proxy = 'http://localhost:5000/';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
  
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
    return `${formattedDate} u ${formattedTime}h.`;
  };  
  
  const currentDate = new Date()
  const givenDate = new Date(items[0]?.scheduledDate)
  console.log("current:", currentDate)
  console.log("given:", givenDate)
  if (currentDate > givenDate) {
    console.log("ostavi review")
  } else {
    console.log("nista")
  }

  console.log(items)

  return (
    <div className='flex flex-col gap-16'>
      {items?.map((item) => (
        <div key={item._id} className='flex gap-4 items-center justify-center sm:justify-between'>
          <div>
            {item.type === 'order' && (
              <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                <img className='h-24 w-24 sm:h-16 sm:w-16 rounded-full object-cover self-center sm:self-start' src={proxy + (item.userId?.imageUrl || '')} alt='' />
                <div className='flex flex-col gap-1 items-center text-center sm:text-start sm:items-start'>
                  {!item.isAccepted ? (
                    <p>
                      Korisnik <span className='font-semibold'>{item.userId.firstName} {item.userId.lastName}</span> Vas je zaposlio putem usluge <Link to={`/post/${item.postId._id}`} className='font-semibold underline'>{item.postId.title}</Link> za datum {formatDate(item.scheduledDate)}
                    </p>
                  ) : (
                    <p>Prihvatili ste ponudu od korisnika <span className='font-semibold'>{item.userId.firstName} {item.userId.lastName}</span> za datum {formatDate(item.scheduledDate)}</p>
                  )}
                  <Link to={`/order/${item._id}`} className='text-orange-500'>
                    {'Vidi zahtev ->'}
                  </Link>
                </div>
              </div>
            )}
            {item.type === 'notification' && (
              <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                <img className='h-24 w-24 sm:h-16 sm:w-16 rounded-full object-cover self-center sm:self-start' src={proxy + (item.workerId.userId.imageUrl || '')} alt='' />
                <div className='flex flex-col gap-1 items-center text-center sm:text-start sm:items-start'>
                {item.isAccepted && currentDate < givenDate ? (
                  <p>Majstor <span className='font-semibold'>{item.workerId.userId.firstName} {item.workerId.userId.lastName}</span> je odobrio Vasu ponudu za datum {formatDate(item.scheduledDate)}</p>
                ) : item.isAccepted && currentDate > givenDate ? (
                  <div>
                    <p>Kakav je bio majstor <span className='font-semibold'>{item.workerId.userId.firstName} {item.workerId.userId.lastName}</span>?</p>
                    <Link to={`/create-review/${item.postId._id}`} className='text-orange-500'>
                    {'Ocenite majstora ->'}
                  </Link>
                  </div>
                ) : 
                <p>Majstor <span className='font-semibold'>{item.workerId.userId.firstName} {item.workerId.userId.lastName}</span> jos nije odobrio Vasu ponudu za datum {formatDate(item.scheduledDate)}</p>
                }
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  
  
};

export default Order;
