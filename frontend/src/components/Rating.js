const Rating = {
  render: (props) => {
    // إذا لم يكن هناك تقييم، عرض 5 نجوم فارغة
    const value = props.value || 0; // إذا كانت القيمة غير موجودة نعرض 0
    return `
    <div class="rating">
      <span>
        <i class="${
          value >= 1
            ? 'fa fa-star'
            : value >= 0.5
            ? 'fa fa-star-half-o'
            : 'fa fa-star-o'
        }"></i>
      </span>  
      <span>
        <i class="${
          value >= 2
            ? 'fa fa-star'
            : value >= 1.5
            ? 'fa fa-star-half-o'
            : 'fa fa-star-o'
        }"></i>
      </span>  
      <span>
        <i class="${
          value >= 3
            ? 'fa fa-star'
            : value >= 2.5
            ? 'fa fa-star-half-o'
            : 'fa fa-star-o'
        }"></i>
      </span>  
      <span>
        <i class="${
          value >= 4
            ? 'fa fa-star'
            : value >= 3.5
            ? 'fa fa-star-half-o'
            : 'fa fa-star-o'
        }"></i>
      </span>  
      <span>
        <i class="${
          value >= 5
            ? 'fa fa-star'
            : value >= 4.5
            ? 'fa fa-star-half-o'
            : 'fa fa-star-o'
        }"></i>
      </span>  
      <span> ${props.text || ''} </span>
    </div>
    `;
  },
};

export default Rating;
