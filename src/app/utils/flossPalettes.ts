/**
 * Системы палитр для вышивальных нитей
 */

export type FlossBrand = 'DMC' | 'Anchor' | 'Madeira' | 'Gamma' | 'J&P Coats' | 'Unknown';

export interface FlossColorData {
  code: string;
  name: string;
  hex: string;
}

/**
 * DMC цвета - самая популярная палитра
 */
export const DMC_COLORS: Record<string, FlossColorData> = {
  // Белые и кремовые
  'B5200': { code: 'B5200', name: 'Snow White', hex: '#FFFFFF' },
  'BLANC': { code: 'BLANC', name: 'White', hex: '#FFFFFF' },
  'ECRU': { code: 'ECRU', name: 'Ecru', hex: '#F5F5DC' },
  
  // Розовые
  '150': { code: '150', name: 'Dusty Rose Ultra Vy Dk', hex: '#AB3E5B' },
  '151': { code: '151', name: 'Dusty Rose Vy Lt', hex: '#F4D4DB' },
  '152': { code: '152', name: 'Shell Pink Med Light', hex: '#E6B8C1' },
  '153': { code: '153', name: 'Violet Very Light', hex: '#E6C6D5' },
  
  // Красные
  '304': { code: '304', name: 'Christmas Red Medium', hex: '#B91E27' },
  '321': { code: '321', name: 'Christmas Red', hex: '#C7252E' },
  '322': { code: '322', name: 'Baby Blue Very Light', hex: '#5D8CB4' },
  '326': { code: '326', name: 'Rose Very Deep', hex: '#B82756' },
  '327': { code: '327', name: 'Violet Dark', hex: '#6A2267' },
  '333': { code: '333', name: 'Blue Violet Very Dark', hex: '#5C6587' },
  
  // Оранжевые
  '402': { code: '402', name: 'Mahogany Very Light', hex: '#F6A57C' },
  '720': { code: '720', name: 'Orange Spice Dark', hex: '#E3620B' },
  '721': { code: '721', name: 'Orange Spice Medium', hex: '#F58137' },
  '740': { code: '740', name: 'Tangerine', hex: '#FF8500' },
  '741': { code: '741', name: 'Tangerine Medium', hex: '#FFA142' },
  '742': { code: '742', name: 'Tangerine Light', hex: '#FFC466' },
  '743': { code: '743', name: 'Yellow Medium', hex: '#FED86C' },
  '744': { code: '744', name: 'Yellow Pale', hex: '#FEEF9F' },
  
  // Желтые
  '307': { code: '307', name: 'Lemon', hex: '#FFD800' },
  '310': { code: '310', name: 'Black', hex: '#000000' },
  '317': { code: '317', name: 'Pewter Gray', hex: '#6C6C6C' },
  '318': { code: '318', name: 'Steel Gray Light', hex: '#A6A8AB' },
  
  // Зеленые
  '469': { code: '469', name: 'Avocado Green', hex: '#709059' },
  '470': { code: '470', name: 'Avocado Green Light', hex: '#8FB471' },
  '471': { code: '471', name: 'Avocado Green Very Light', hex: '#A9C98A' },
  '500': { code: '500', name: 'Blue Green Very Dark', hex: '#0F4935' },
  '501': { code: '501', name: 'Blue Green Dark', hex: '#3C6F5E' },
  '502': { code: '502', name: 'Blue Green', hex: '#559A7F' },
  '503': { code: '503', name: 'Blue Green Medium', hex: '#93C6B5' },
  '504': { code: '504', name: 'Blue Green Very Light', hex: '#C6E4DB' },
  
  // Синие
  '517': { code: '517', name: 'Wedgewood Dark', hex: '#305982' },
  '518': { code: '518', name: 'Wedgewood Light', hex: '#4F8DAC' },
  '519': { code: '519', name: 'Sky Blue', hex: '#7EB6D1' },
  '597': { code: '597', name: 'Turquoise', hex: '#1A6C8E' },
  '598': { code: '598', name: 'Turquoise Light', hex: '#69C2DB' },
  
  // Фиолетовые
  '702': { code: '702', name: 'Kelly Green', hex: '#00A651' },
  '703': { code: '703', name: 'Chartreuse', hex: '#87BC40' },
  '704': { code: '704', name: 'Chartreuse Bright', hex: '#B3D547' },
  '798': { code: '798', name: 'Delft Blue Dark', hex: '#46829D' },
  '799': { code: '799', name: 'Delft Blue Medium', hex: '#7BAAC8' },
  
  // Коричневые
  '800': { code: '800', name: 'Delft Blue Pale', hex: '#C4DBE5' },
  '801': { code: '801', name: 'Coffee Brown Dark', hex: '#6B4423' },
  '898': { code: '898', name: 'Coffee Brown Very Dark', hex: '#4E2E28' },
  '938': { code: '938', name: 'Coffee Brown Ultra Dark', hex: '#381E11' },
  
  // 3000 серия
  '3078': { code: '3078', name: 'Golden Yellow Very Light', hex: '#FFF59E' },
  '3325': { code: '3325', name: 'Baby Blue Light', hex: '#B0C8E3' },
  '3326': { code: '3326', name: 'Rose Light', hex: '#F8B7CD' },
  '3685': { code: '3685', name: 'Mauve Very Dark', hex: '#7D2641' },
  '3687': { code: '3687', name: 'Mauve', hex: '#C04B6F' },
  '3688': { code: '3688', name: 'Mauve Medium', hex: '#D77595' },
  '3689': { code: '3689', name: 'Mauve Light', hex: '#F4B3C7' },
  '3705': { code: '3705', name: 'Melon Dark', hex: '#FF7E93' },
  '3706': { code: '3706', name: 'Melon Medium', hex: '#FFA0B2' },
  '3708': { code: '3708', name: 'Melon Light', hex: '#FECBDB' },
  '3713': { code: '3713', name: 'Salmon Very Light', hex: '#F9DCD6' },
  '3716': { code: '3716', name: 'Dusty Rose Very Light', hex: '#FCC4CD' },
  '3721': { code: '3721', name: 'Shell Pink Dark', hex: '#8B3850' },
  '3722': { code: '3722', name: 'Shell Pink Medium', hex: '#AA5766' },
  '3726': { code: '3726', name: 'Antique Mauve Dark', hex: '#A77678' },
  '3727': { code: '3727', name: 'Antique Mauve Light', hex: '#D2A5A7' },
  '3740': { code: '3740', name: 'Antique Violet Dark', hex: '#9B8DA0' },
  '3743': { code: '3743', name: 'Antique Violet Very Light', hex: '#DBDAE1' },
  '3746': { code: '3746', name: 'Blue Violet Dark', hex: '#786FA6' },
  '3747': { code: '3747', name: 'Blue Violet Very Light', hex: '#D4DEE9' },
  '3750': { code: '3750', name: 'Antique Blue Very Dark', hex: '#2F5173' },
  '3752': { code: '3752', name: 'Antique Blue Very Light', hex: '#C5D5DD' },
  '3753': { code: '3753', name: 'Antique Blue Ultra Very Light', hex: '#DDE7ED' },
  '3755': { code: '3755', name: 'Baby Blue', hex: '#92B4D7' },
  '3756': { code: '3756', name: 'Baby Blue Ultra Very Light', hex: '#F0F4F8' },
  '3760': { code: '3760', name: 'Wedgewood Medium', hex: '#40749E' },
  '3761': { code: '3761', name: 'Sky Blue Light', hex: '#CBDEE6' },
  '3765': { code: '3765', name: 'Peacock Blue Very Dark', hex: '#2F6B7C' },
  '3766': { code: '3766', name: 'Peacock Blue Light', hex: '#6FAAB8' },
  '3768': { code: '3768', name: 'Grey Green Dark', hex: '#5F7E7D' },
  '3770': { code: '3770', name: 'Tawny Very Light', hex: '#FFFAE7' },
  '3772': { code: '3772', name: 'Desert Sand Very Dark', hex: '#C19A6B' },
  '3773': { code: '3773', name: 'Desert Sand Medium', hex: '#D4B091' },
  '3774': { code: '3774', name: 'Desert Sand Very Light', hex: '#F3DEC9' },
  '3776': { code: '3776', name: 'Mahogany Light', hex: '#D27C47' },
  '3777': { code: '3777', name: 'Terra Cotta Very Dark', hex: '#9B3829' },
  '3778': { code: '3778', name: 'Terra Cotta Light', hex: '#D87E68' },
  '3779': { code: '3779', name: 'Terra Cotta Ultra Very Light', hex: '#F9C1B4' },
  '3781': { code: '3781', name: 'Mocha Brown Dark', hex: '#715640' },
  '3782': { code: '3782', name: 'Mocha Brown Light', hex: '#BFA68A' },
  '3787': { code: '3787', name: 'Brown Gray Dark', hex: '#6D6360' },
  '3790': { code: '3790', name: 'Beige Gray Ultra Dark', hex: '#967C6F' },
  '3799': { code: '3799', name: 'Pewter Gray Very Dark', hex: '#4A4A4A' },
  '3801': { code: '3801', name: 'Christmas Red Very Dark', hex: '#CC3344' },
  '3802': { code: '3802', name: 'Antique Mauve Very Dark', hex: '#6E5A5B' },
  '3803': { code: '3803', name: 'Mauve Dark', hex: '#A14C73' },
  '3804': { code: '3804', name: 'Cyclamen Pink Dark', hex: '#DF1B6C' },
  '3805': { code: '3805', name: 'Cyclamen Pink', hex: '#F653A6' },
  '3806': { code: '3806', name: 'Cyclamen Pink Light', hex: '#FFB3D9' },
  '3807': { code: '3807', name: 'Cornflower Blue', hex: '#657CA4' },
  '3808': { code: '3808', name: 'Turquoise Ultra Very Dark', hex: '#2E7D87' },
  '3809': { code: '3809', name: 'Turquoise Very Dark', hex: '#3C969F' },
  '3810': { code: '3810', name: 'Turquoise Dark', hex: '#4FA9AF' },
  '3811': { code: '3811', name: 'Turquoise Very Light', hex: '#B9E5E8' },
  '3812': { code: '3812', name: 'Sea Green Very Dark', hex: '#2C8278' },
  '3813': { code: '3813', name: 'Blue Green Light', hex: '#B3CFB8' },
  '3814': { code: '3814', name: 'Aquamarine', hex: '#4FA294' },
  '3815': { code: '3815', name: 'Celadon Green Dark', hex: '#477965' },
  '3816': { code: '3816', name: 'Celadon Green', hex: '#68997D' },
  '3817': { code: '3817', name: 'Celadon Green Light', hex: '#A8C7B7' },
  '3818': { code: '3818', name: 'Emerald Green Ultra Very Dark', hex: '#15503E' },
  '3819': { code: '3819', name: 'Moss Green Light', hex: '#E2EE7B' },
  '3820': { code: '3820', name: 'Straw Dark', hex: '#D9B652' },
  '3821': { code: '3821', name: 'Straw', hex: '#EBD475' },
  '3822': { code: '3822', name: 'Straw Light', hex: '#F6E7B4' },
  '3823': { code: '3823', name: 'Yellow Ultra Pale', hex: '#FFFAD4' },
  '3824': { code: '3824', name: 'Apricot Light', hex: '#FEDCCE' },
  '3825': { code: '3825', name: 'Pumpkin Pale', hex: '#FDBB7C' },
  '3826': { code: '3826', name: 'Golden Brown', hex: '#AE7548' },
  '3827': { code: '3827', name: 'Golden Brown Pale', hex: '#F6B783' },
  '3828': { code: '3828', name: 'Hazelnut Brown', hex: '#B88460' },
  '3829': { code: '3829', name: 'Old Gold Very Dark', hex: '#A3743A' },
  '3830': { code: '3830', name: 'Terra Cotta', hex: '#CA6750' },
  '3831': { code: '3831', name: 'Raspberry Dark', hex: '#B83A5E' },
  '3832': { code: '3832', name: 'Raspberry Medium', hex: '#DB6483' },
  '3833': { code: '3833', name: 'Raspberry Light', hex: '#F2A2B8' },
  '3834': { code: '3834', name: 'Grape Dark', hex: '#723A64' },
  '3835': { code: '3835', name: 'Grape Medium', hex: '#9A5C86' },
  '3836': { code: '3836', name: 'Grape Light', hex: '#C59BB3' },
  '3837': { code: '3837', name: 'Lavender Ultra Dark', hex: '#6C4675' },
  '3838': { code: '3838', name: 'Lavender Blue Dark', hex: '#5884A5' },
  '3839': { code: '3839', name: 'Lavender Blue Medium', hex: '#7699BE' },
  '3840': { code: '3840', name: 'Lavender Blue Light', hex: '#B4CADE' },
  '3841': { code: '3841', name: 'Baby Blue Pale', hex: '#CDDEE8' },
  '3842': { code: '3842', name: 'Wedgewood Very Dark', hex: '#2A567B' },
  '3843': { code: '3843', name: 'Electric Blue', hex: '#14A5C7' },
  '3844': { code: '3844', name: 'Turquoise Bright Dark', hex: '#0E9BAB' },
  '3845': { code: '3845', name: 'Turquoise Bright Medium', hex: '#0BB4C6' },
  '3846': { code: '3846', name: 'Turquoise Bright Light', hex: '#05D0DD' },
  '3847': { code: '3847', name: 'Teal Green Dark', hex: '#2B8787' },
  '3848': { code: '3848', name: 'Teal Green Medium', hex: '#53A09C' },
  '3849': { code: '3849', name: 'Teal Green Light', hex: '#8ACAC3' },
  '3850': { code: '3850', name: 'Bright Green Dark', hex: '#379A77' },
  '3851': { code: '3851', name: 'Bright Green Light', hex: '#6ABF94' },
  '3852': { code: '3852', name: 'Straw Very Dark', hex: '#CD9A3C' },
  '3853': { code: '3853', name: 'Autumn Gold Dark', hex: '#F29640' },
  '3854': { code: '3854', name: 'Autumn Gold Medium', hex: '#F6B46D' },
  '3855': { code: '3855', name: 'Autumn Gold Light', hex: '#FAD89C' },
  '3856': { code: '3856', name: 'Mahogany Ultra Very Light', hex: '#FFCFB3' },
  '3857': { code: '3857', name: 'Rosewood Dark', hex: '#6F3437' },
  '3858': { code: '3858', name: 'Rosewood Medium', hex: '#985159' },
  '3859': { code: '3859', name: 'Rosewood Light', hex: '#C39A9D' },
  '3860': { code: '3860', name: 'Cocoa', hex: '#836F6E' },
  '3861': { code: '3861', name: 'Cocoa Light', hex: '#C7B5B4' },
  '3862': { code: '3862', name: 'Mocha Beige Dark', hex: '#856449' },
  '3863': { code: '3863', name: 'Mocha Beige Medium', hex: '#A48567' },
  '3864': { code: '3864', name: 'Mocha Beige Light', hex: '#C9B195' },
  '3865': { code: '3865', name: 'Winter White', hex: '#F9F7F4' },
  '3866': { code: '3866', name: 'Mocha Brown Ultra Very Light', hex: '#FAF3EB' },
};

/**
 * Anchor цвета - вторая по популярности палитра
 */
export const ANCHOR_COLORS: Record<string, FlossColorData> = {
  '1': { code: '1', name: 'White', hex: '#FFFFFF' },
  '2': { code: '2', name: 'Snow White', hex: '#FFFFFF' },
  '4': { code: '4', name: 'Cyclamen Pink', hex: '#D4006E' },
  '5': { code: '5', name: 'Rose Pink', hex: '#FFB0C1' },
  '6': { code: '6', name: 'Salmon Pink', hex: '#FF9999' },
  '7': { code: '7', name: 'Coral Pink', hex: '#FF8C8C' },
  '8': { code: '8', name: 'Peach', hex: '#FFCCAA' },
  '9': { code: '9', name: 'Salmon', hex: '#DC787F' },
  '10': { code: '10', name: 'Fuchsia Very Light', hex: '#FF94D6' },
  '11': { code: '11', name: 'Coral Red', hex: '#FF6666' },
  '13': { code: '13', name: 'Pink', hex: '#FFAACC' },
  '16': { code: '16', name: 'Garnet Medium', hex: '#8E0034' },
  '18': { code: '18', name: 'Cerise Dark', hex: '#DC006B' },
  '20': { code: '20', name: 'Shrimp Very Dark', hex: '#DE4D66' },
  '22': { code: '22', name: 'Scarlet', hex: '#DD0000' },
  '23': { code: '23', name: 'Apple Blossom Pink', hex: '#FFDEDE' },
  '25': { code: '25', name: 'Carnation Very Light', hex: '#FFDEE8' },
  '26': { code: '26', name: 'Carnation Light', hex: '#FF9EC2' },
  '27': { code: '27', name: 'Carnation Medium', hex: '#FF69B4' },
  '28': { code: '28', name: 'Carnation Dark', hex: '#FF1493' },
  '29': { code: '29', name: 'Carnation Very Dark', hex: '#D6006B' },
  '31': { code: '31', name: 'Cranberry Light', hex: '#FF8FA6' },
  '32': { code: '32', name: 'Cranberry Medium Light', hex: '#E86C8A' },
  '33': { code: '33', name: 'Cranberry Medium', hex: '#DC5577' },
  '35': { code: '35', name: 'Fuchsia', hex: '#FF00AA' },
  '38': { code: '38', name: 'Cranberry Very Dark', hex: '#A1154D' },
  '39': { code: '39', name: 'Cranberry Ultra Dark', hex: '#8B0044' },
  '40': { code: '40', name: 'Old Rose Medium', hex: '#9B4966' },
  '41': { code: '41', name: 'Old Rose Dark', hex: '#7A3355' },
  '42': { code: '42', name: 'Mauve Very Light', hex: '#FFC9E8' },
  '43': { code: '43', name: 'Mauve Light', hex: '#FFB3DD' },
  '44': { code: '44', name: 'Mauve Medium', hex: '#D68FC2' },
  '45': { code: '45', name: 'Mauve Dark', hex: '#B85FA6' },
  '46': { code: '46', name: 'Red', hex: '#CC0000' },
  '47': { code: '47', name: 'Violet Very Light', hex: '#E8C4E8' },
  '48': { code: '48', name: 'Violet Light', hex: '#D6A8D6' },
  '49': { code: '49', name: 'Violet Medium', hex: '#C080C0' },
  '50': { code: '50', name: 'Rose', hex: '#FF6699' },
  '52': { code: '52', name: 'Plum Very Light', hex: '#E0C8E0' },
  '54': { code: '54', name: 'Plum Light', hex: '#C8A0C8' },
  '58': { code: '58', name: 'Orchid Very Light', hex: '#E8D0FF' },
  '59': { code: '59', name: 'Orchid Light', hex: '#D6B0FF' },
  '60': { code: '60', name: 'Orchid Medium', hex: '#B880E8' },
  '62': { code: '62', name: 'Bright Pink Medium', hex: '#FF69B4' },
  '63': { code: '63', name: 'Magenta Light', hex: '#FF80FF' },
  '65': { code: '65', name: 'Magenta Medium', hex: '#E060E0' },
  '66': { code: '66', name: 'Magenta Dark', hex: '#C040C0' },
  '68': { code: '68', name: 'Magenta Very Dark', hex: '#A020A0' },
  '69': { code: '69', name: 'Purple Very Light', hex: '#D0B0E8' },
  '70': { code: '70', name: 'Purple Light', hex: '#B080D6' },
  '72': { code: '72', name: 'Purple Medium', hex: '#9060C0' },
  '74': { code: '74', name: 'Purple Dark', hex: '#7040A0' },
  '76': { code: '76', name: 'Purple Very Dark', hex: '#502080' },
  '77': { code: '77', name: 'Wine Red Very Light', hex: '#DC8FA6' },
  '78': { code: '78', name: 'Wine Red Light', hex: '#C86F8A' },
  '84': { code: '84', name: 'Baby Blue Very Light', hex: '#D0E8FF' },
  '85': { code: '85', name: 'Baby Blue Light', hex: '#B0D6FF' },
  '86': { code: '86', name: 'Baby Blue Medium', hex: '#90C0E8' },
  '87': { code: '87', name: 'Baby Blue Dark', hex: '#70A0C8' },
  '88': { code: '88', name: 'Navy Blue Very Dark', hex: '#203060' },
  '89': { code: '89', name: 'Cornflower Blue Very Light', hex: '#C8D6FF' },
  '90': { code: '90', name: 'Cornflower Blue Light', hex: '#A8B8E8' },
  '91': { code: '91', name: 'Cornflower Blue Medium', hex: '#8898D0' },
  '92': { code: '92', name: 'Cornflower Blue Dark', hex: '#6878B0' },
  '94': { code: '94', name: 'Delft Blue Light', hex: '#B0C8E0' },
  '95': { code: '95', name: 'Delft Blue Medium', hex: '#90A8C8' },
  '96': { code: '96', name: 'Delft Blue Dark', hex: '#7088B0' },
  '98': { code: '98', name: 'Royal Blue Medium', hex: '#4060A0' },
  '99': { code: '99', name: 'Royal Blue Dark', hex: '#204080' },
  '100': { code: '100', name: 'Violet Dark', hex: '#6020A0' },
};

/**
 * Gamma (ПНК им. Кирова) - российская палитра
 */
export const GAMMA_COLORS: Record<string, FlossColorData> = {
  '0001': { code: '0001', name: 'Белый', hex: '#FFFFFF' },
  '0002': { code: '0002', name: 'Молочный', hex: '#FFFEF0' },
  '0003': { code: '0003', name: 'Кремовый', hex: '#FFF8DC' },
  '0101': { code: '0101', name: 'Ярко-красный', hex: '#DC143C' },
  '0102': { code: '0102', name: 'Красный', hex: '#B22222' },
  '0103': { code: '0103', name: 'Темно-красный', hex: '#8B0000' },
  '0201': { code: '0201', name: 'Розовый', hex: '#FFB6C1' },
  '0202': { code: '0202', name: 'Ярко-розовый', hex: '#FF69B4' },
  // Добавьте больше цветов Gamma по необходимости
};

/**
 * Madeira цвета
 */
export const MADEIRA_COLORS: Record<string, FlossColorData> = {
  '0101': { code: '0101', name: 'White', hex: '#FFFFFF' },
  '0102': { code: '0102', name: 'Pale Peach', hex: '#FFE4D6' },
  '0201': { code: '0201', name: 'Coral', hex: '#FF7F50' },
  // Добавьте больше цветов Madeira по необходимости
};

/**
 * Определяет тип палитры по коду
 */
export function detectFlossBrand(code: string): FlossBrand {
  // DMC: обычно 3-4 цифры или B5200, BLANC, ECRU
  if (code.match(/^(B5200|BLANC|ECRU)$/i)) return 'DMC';
  if (code.match(/^\d{3,4}$/) && parseInt(code) >= 100) {
    // Проверяем есть ли в DMC
    if (DMC_COLORS[code]) return 'DMC';
  }
  
  // Gamma: обычно 4 цифры с нулями впереди (0001-9999)
  if (code.match(/^0\d{3}$/)) return 'Gamma';
  
  // Anchor: обычно 1-4 цифры
  if (code.match(/^\d{1,4}$/) && parseInt(code) < 1000) {
    if (ANCHOR_COLORS[code]) return 'Anchor';
  }
  
  // Madeira: обычно 4 цифры
  if (code.match(/^\d{4}$/) && MADEIRA_COLORS[code]) return 'Madeira';
  
  return 'Unknown';
}

/**
 * Получает данные цвета по коду и бренду
 */
export function getFlossColor(code: string, brand?: FlossBrand): FlossColorData {
  const detectedBrand = brand || detectFlossBrand(code);
  
  let colorData: FlossColorData | undefined;
  
  switch (detectedBrand) {
    case 'DMC':
      colorData = DMC_COLORS[code];
      break;
    case 'Anchor':
      colorData = ANCHOR_COLORS[code];
      break;
    case 'Gamma':
      colorData = GAMMA_COLORS[code];
      break;
    case 'Madeira':
      colorData = MADEIRA_COLORS[code];
      break;
  }
  
  // Если не нашли, возвращаем базовые данные
  if (!colorData) {
    return {
      code,
      name: `${detectedBrand} ${code}`,
      hex: generateColorFromCode(code),
    };
  }
  
  return colorData;
}

/**
 * Генерирует цвет из кода (для неизвестных кодов)
 */
function generateColorFromCode(code: string): string {
  // Простой хэш для генерации цвета
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Получает все доступные палитры
 */
export function getAllPalettes(): Record<FlossBrand, Record<string, FlossColorData>> {
  return {
    'DMC': DMC_COLORS,
    'Anchor': ANCHOR_COLORS,
    'Gamma': GAMMA_COLORS,
    'Madeira': MADEIRA_COLORS,
    'J&P Coats': {},
    'Unknown': {},
  };
}