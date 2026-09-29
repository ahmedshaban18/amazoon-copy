import { getUserInfo } from '../localStorage';


const Header = {
  render: () => {
    const { name, isAdmin } = getUserInfo();
    
    return ` 
    
    
    <a href="/#/"><!---<img src="" alt="">-->  LOGO</a>
    
    <ul class="sidebar">
    <li id="hideSidebarBtn"><a><svg xmlns="http://www.w3.org/2000/svg" height="35" viewBox="0 96 960 960" width="55"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg></a></li>
    <li><a href="/#/">Home</a></li>
    <li><a href="/#/shop">Shop</a></li>
    <li>${
      name
      ? `<a href="/#/profile">${name}</a>`
      : `<a href="/#/signin">SignIn</a>`
    } </li>
    
    ${isAdmin 
      ? `<li><a href="/#/dashboard">Dashboard</a></li>` 
      : ''
    }
    <li><a href="/#/cart">cart</a></li>
    </ul>
    
    
    
    
    
    <ul id="navbar">
    <li class="hideOnMobile"><a href="/#/">Home</a></li>
    <li class="hideOnMobile"><a href="/#/shop">Shop</a></li>
    <li class="hideOnMobile">${
      name
      ? `<a href="/#/profile">${name}</a>`
        : `<a href="/#/signin">SignIn</a>`
      } </li>
      
      ${isAdmin 
        ? `<li class="hideOnMobile"><a href="/#/dashboard">Dashboard</a></li>` 
        : ''
      }
      <li class="hideOnMobile"><a href="/#/cart">cart</a></li>
      <li class="menu-button" id="showSidebarBtn"><a><svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 96 960 960" width="40"><path d="M120 816v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z"/></svg></a></li>
      </ul>
      
      

    `;
  },
  after_render: () => {

    document.getElementById('showSidebarBtn').addEventListener('click', () => {
      document.querySelector('.sidebar').style.display = 'flex';
    });

    document.getElementById('hideSidebarBtn').addEventListener('click', () => {
      document.querySelector('.sidebar').style.display = 'none';
    });
  },
};

export default Header;
//import { parseRequestUrl } from '../utils';
// const { value } = parseRequestUrl();

//<div class="search">
//<form class="search-form"  id="search-form">
//<input type="text" name="q" id="q" value="${value || ''}" /> 
//<button type="submit"><i class="fa fa-search"></i></button>
//</form>        
//</div>

// document
//.getElementById('search-form')
//.addEventListener('submit', async (e) => {
//  e.preventDefault();
//  const searchKeyword = document.getElementById('q').value;
//  document.location.hash = `/?q=${searchKeyword}`;
//});
//
//document
//.getElementById('aside-open-button')
//.addEventListener('click', async () => {
//  document.getElementById('aside-container').classList.add('open');
//});
//},