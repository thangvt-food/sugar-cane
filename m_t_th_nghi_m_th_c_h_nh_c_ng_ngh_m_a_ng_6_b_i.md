{
  "mon_hoc": "Thực hành Công nghệ Sản xuất Đường mía",
  "noi_dung_video": "Hướng dẫn thí nghiệm thực hành sản xuất đường mía từ nguyên liệu đến thành phẩm",
  "so_luong_bai": 6,
  "danh_sach_bai_thi_nghiem": [
    {
      "bai_so": 1,
      "ten_bai": "Đánh giá chất lượng nguyên liệu mía và xác định chữ đường (CCS)",
      "mo_ta_thi_nghiem": "Mía sau khi thu hoạch và vận chuyển về phòng thí nghiệm được phân loại, làm sạch bụi bẩn và rễ lá khô bám trên thân. Sinh viên tiến hành đo đạc kích thước, cân khối lượng nguyên liệu và tiến hành lấy mẫu kiểm tra độ chín bằng cách trích dịch ở các vị trí ngọn, thân và gốc cây mía. Mẫu nước mía ép ban đầu được lọc qua vải lọc mịn để loại bỏ vụn bã cơ học, sau đó đem xác định độ khô hòa tan bằng khúc xạ kế (độ Brix) và làm trong bằng chì acetate để đo góc quay cực trên phân cực kế (độ Pol). Dựa trên các giá trị đo được, tiến hành tính độ tinh khiết biểu kiến và chữ đường thương phẩm để kết luận khả năng thu hồi đường của lô mía.",
      "thong_so_thuc_nghiem": [
        "Khối lượng mẫu mía nạp ban đầu: m_mia (kg)",
        "Độ Brix nước mía nguyên liệu: Bx (%)",
        "Độ Pol nước mía nguyên liệu: Pol (%)",
        "Tỷ lệ hàm lượng xơ trong mía: F (%)"
      ],
      "cong_thuc_tinh_toan": [
        {
          "ten_chi_tieu": "Độ tinh khiết biểu kiến",
          "ky_hieu": "AP (%)",
          "cong_thuc": "AP = (Pol / Bx) * 100",
          "giai_thich": "Tỷ lệ phần trăm giữa lượng saccharose biểu kiến (Pol) và tổng chất khô hòa tan (Brix)."
        },
        {
          "ten_chi_tieu": "Hệ số chín của cây mía",
          "ky_hieu": "K_chin (%)",
          "cong_thuc": "K_chin = (Bx_ngon / Bx_goc) * 100",
          "giai_thich": "Đánh giá mức độ tích tụ đường từ gốc lên ngọn (mía chín tối ưu khi K_chin đạt từ 85% đến 95%)."
        },
        {
          "ten_chi_tieu": "Chữ đường thương mại (Commercial Cane Sugar)",
          "ky_hieu": "CCS (%)",
          "cong_thuc": "CCS = 1.5 * Pol * [1 - (F + 5) / 100] - 0.5 * Bx * [1 - (F + 3) / 100]",
          "giai_thich": "Lượng đường thương phẩm có thể thu hồi từ 100 kg cây mía nguyên liệu dựa trên hàm lượng Pol, Brix và xơ mía (F)."
        }
      ]
    },
    {
      "bai_so": 2,
      "ten_bai": "Thực hành ép mía và đánh giá hiệu suất ép",
      "mo_ta_thi_nghiem": "Cây mía đã được chuẩn bị sẽ được đưa qua máy xé hoặc chặt thành từng đoạn ngắn nhằm phá vỡ cấu trúc mô tế bào thực vật, giải phóng triệt để túi dịch bào chứa saccharose. Nguyên liệu đã xé tơi được đưa lần lượt qua hệ thống trục ép cơ học với áp lực nén điều chỉnh phù hợp; trong phương pháp ép thẩm thấu (ép ướt), nước ấm ở nhiệt độ 50 - 60 độ C được phun tưới đều lên bề mặt lớp bã sau mỗi lần ép để hòa tan lượng đường còn lưu lại. Thu hồi toàn bộ thể tích nước mía hỗn hợp vào bình chứa và thu gom lượng bã mía khô sau dàn ép, tiến hành cân chính xác khối lượng từng phần và lấy mẫu phân tích Pol dư trong bã mía để đánh giá mức độ kiệt đường.",
      "thong_so_thuc_nghiem": [
        "Khối lượng mía đem ép: m_mia (kg)",
        "Khối lượng nước mía hỗn hợp thu được: m_nm (kg)",
        "Khối lượng bã mía sau ép: m_ba (kg)",
        "Lượng nước thẩm thấu phun bổ sung: m_nuoc_tt (kg)",
        "Độ Pol của mía nguyên liệu: Pol_mia (%)",
        "Độ Pol của bã mía: Pol_ba (%)",
        "Độ Pol nước mía hỗn hợp: Pol_nm (%)"
      ],
      "cong_thuc_tinh_toan": [
        {
          "ten_chi_tieu": "Tỷ lệ trích ly nước mía",
          "ky_hieu": "Y_nm (%)",
          "cong_thuc": "Y_nm = (m_nm / m_mia) * 100",
          "giai_thich": "Tỷ lệ phần trăm khối lượng dịch nước mía thu được so với tổng khối lượng cây mía ban đầu."
        },
        {
          "ten_chi_tieu": "Hiệu suất ép trích ly đường (Extraction Efficiency)",
          "ky_hieu": "H_ep (%)",
          "cong_thuc": "H_ep = [(m_nm * Pol_nm) / (m_mia * Pol_mia)] * 100",
          "giai_thich": "Tỷ số giữa tổng lượng saccharose thu hồi được trong nước mía hỗn hợp so với tổng lượng saccharose có trong cây mía ban đầu."
        },
        {
          "ten_chi_tieu": "Hiệu suất ép tính theo tổn thất bã mía",
          "ky_hieu": "H_ep_ba (%)",
          "cong_thuc": "H_ep_ba = [1 - (m_ba * Pol_ba) / (m_mia * Pol_mia)] * 100",
          "giai_thich": "Hiệu suất trích ly đường xác định dựa trên tỷ lệ saccharose bị tổn thất theo bã mía ra ngoài."
        }
      ]
    },
    {
      "bai_so": 3,
      "ten_bai": "Làm sạch nước mía bằng phương pháp vôi hóa và gia nhiệt",
      "mo_ta_thi_nghiem": "Nước mía hỗn hợp sau khi ép có tính axit yếu (pH khoảng 5.0 - 5.5) và chứa nhiều protein keo, hợp chất phenolic, pectin và axit hữu cơ làm đục dung dịch. Quá trình làm sạch được thực hiện bằng cách gia nhiệt sơ bộ nước mía lên 55 - 60 độ C, tiếp tục châm từ từ huyền phù sữa vôi Ca(OH)2 nồng độ 10 - 12 độ Be nhằm nâng giá trị pH lên vùng trung hòa (pH = 7.0 - 7.2) để tạo phức canxi phosphat và keo tụ protein. Hỗn hợp tiếp tục được gia nhiệt nhanh đến sôi (100 - 105 độ C) để hỗ trợ quá trình kết tủa hoàn toàn các muối không tan, chuyển sang ống lắng có bổ sung chất trợ lắng (flocculant), gạn lấy lớp nước chè trong và lọc lấy phần bã bùn đáy.",
      "thong_so_thuc_nghiem": [
        "Thể tích và khối lượng nước mía hỗn hợp: V_hh, m_hh",
        "Độ Brix và Pol nước mía hỗn hợp: Bx_hh, Pol_hh",
        "Thể tích nước chè trong thu được: V_trong, m_trong",
        "Độ Brix và Pol của nước chè trong: Bx_trong, Pol_trong",
        "Độ tinh khiết trước làm sạch: AP_hh (%)",
        "Độ tinh khiết sau làm sạch: AP_trong (%)"
      ],
      "cong_thuc_tinh_toan": [
        {
          "ten_chi_tieu": "Hiệu quả nâng cao độ tinh khiết (Hiệu quả làm sạch)",
          "ky_hieu": "Delta_AP (%)",
          "cong_thuc": "Delta_AP = AP_trong - AP_hh",
          "giai_thich": "Mức độ gia tăng độ tinh khiết biểu kiến của nước mía sau khi loại trừ tạp chất không đường."
        },
        {
          "ten_chi_tieu": "Hiệu suất loại bỏ chất không đường",
          "ky_hieu": "H_loai_tap (%)",
          "cong_thuc": "H_loai_tap = [1 - (Bx_trong - Pol_trong) / (Bx_hh - Pol_hh)] * 100",
          "giai_thich": "Tỷ lệ phần trăm các chất không đường đã được kết tủa và tách ra khỏi nước mía theo bã bùn."
        },
        {
          "ten_chi_tieu": "Hiệu suất thu hồi saccharose ở công đoạn làm sạch",
          "ky_hieu": "H_ls (%)",
          "cong_thuc": "H_ls = [(m_trong * Pol_trong) / (m_hh * Pol_hh)] * 100",
          "giai_thich": "Tỷ lệ saccharose giữ lại được trong nước mía trong sau khi trừ đi tổn thất saccharose trong bùn lắng."
        }
      ]
    },
    {
      "bai_so": 4,
      "ten_bai": "Cô đặc nước mía thành mật chè (Siro)",
      "mo_ta_thi_nghiem": "Nước chè trong sau quá trình lọc làm sạch có nồng độ chất khô hòa tan thấp (chỉ khoảng 13 - 15 độ Brix), cần được bốc hơi một lượng lớn nước để nâng nồng độ lên 60 - 65 độ Brix nhằm chuẩn bị điều kiện quá bão hòa cho việc kết tinh. Dung dịch chè trong được nạp vào nồi cô đặc chân không hoặc nồi đun có cánh khuấy kiểm soát nhiệt độ, duy trì gia nhiệt đều đặn và kiểm soát áp suất để giảm thiểu hiện tượng caramel hóa đường và biến đổi màu dịch. Trong quá trình cô đặc, tiến hành lấy mẫu định kỳ tại các mốc thời gian để đo độ Brix, kiểm tra độ pH và nhiệt độ sôi của dung dịch, ngừng cấp nhiệt khi mật chè đạt dải Brix quy định.",
      "thong_so_thuc_nghiem": [
        "Khối lượng nước mía chè trong nạp vào nồi: m_cd_vao (kg)",
        "Độ Brix của nước mía chè trong nạp vào: Bx_vao (%)",
        "Khối lượng mật chè (siro) thu được: m_cd_ra (kg)",
        "Độ Brix của mật chè thu được: Bx_ra (%)",
        "Lượng nước bốc hơi thực tế: W_tt (kg)"
      ],
      "cong_thuc_tinh_toan": [
        {
          "ten_chi_tieu": "Lượng nước bốc hơi lý thuyết",
          "ky_hieu": "W_lt (kg)",
          "cong_thuc": "W_lt = m_cd_vao * [1 - (Bx_vao / Bx_ra)]",
          "giai_thich": "Khối lượng nước cần làm bay hơi khỏi thể tích nước mía ban đầu để đạt nồng độ Brix mật chè mong muốn."
        },
        {
          "ten_chi_tieu": "Tỷ số cô đặc (Hệ số cô đặc)",
          "ky_hieu": "K_cd",
          "cong_thuc": "K_cd = Bx_ra / Bx_vao = m_cd_vao / m_cd_ra",
          "giai_thich": "Mức độ tăng nồng độ chất tan qua quá trình làm bốc hơi dung môi."
        },
        {
          "ten_chi_tieu": "Hiệu suất bảo toàn chất khô hòa tan trong quá trình cô đặc",
          "ky_hieu": "H_cd (%)",
          "cong_thuc": "H_cd = [(m_cd_ra * Bx_ra) / (m_cd_vao * Bx_vao)] * 100",
          "giai_thich": "Đánh giá mức độ tổn thất chất khô hòa tan do trào bọt, bắn tóe hoặc phân hủy nhiệt."
        }
      ]
    },
    {
      "bai_so": 5,
      "ten_bai": "Kỹ thuật nấu đường non và gây mầm kết tinh",
      "mo_ta_thi_nghiem": "Mật chè sau cô đặc tiếp tục được gia nhiệt trong điều kiện áp suất chân không để nâng nồng độ dung dịch vượt ngưỡng bão hòa ($S_s > 1.0$), bước vào vùng quá bão hòa giả bền thích hợp cho sự hình thành mầm tinh thể. Sinh viên quan sát hiện tượng kết sợi của giọt mật chè, tiến hành đưa giống mầm đường mịn (đường bột pha cồn hoặc dung dịch mầm chuẩn) vào nồi nấu với khối lượng và kích thước đồng đều nhằm định hình nhân tinh thể. Sau giai đoạn gây mầm, duy trì cấp liên tục từng đợt siro mới với tốc độ ổn định kết hợp điều chỉnh chân không và nhiệt độ sôi thích hợp để các phân tử saccharose tiếp tục bồi đắp làm lớn mầm tinh thể mà không sinh ra mầm dại, tạo thành khối hỗn hợp đường non gồm các tinh thể đường lơ lửng trong mật cái.",
      "thong_so_thuc_nghiem": [
        "Độ Brix mật chè đưa vào nấu: Bx_siro (%)",
        "Độ Brix đường non kết thúc nấu: Bx_non (%)",
        "Độ Pol đường non thu được: Pol_non (%)",
        "Độ tinh khiết của mật chè nạp: J (%)",
        "Độ tinh khiết của đường non: AP_non (%)",
        "Hệ số quá bão hòa tại điểm gieo mầm: S_s"
      ],
      "cong_thuc_tinh_toan": [
        {
          "ten_chi_tieu": "Hệ số quá bão hòa",
          "ky_hieu": "S_s",
          "cong_thuc": "S_s = C_tt / C_bh",
          "giai_thich": "Tỷ số giữa nồng độ saccharose thực tế trong dung dịch tại thời điểm nấu (C_tt) và nồng độ hòa tan bão hòa ở cùng nhiệt độ (C_bh); điểm gây giống lý tưởng khi S_s nằm trong khoảng 1.20 - 1.35."
        },
        {
          "ten_chi_tieu": "Tỷ lệ tinh thể hóa lý thuyết trong đường non",
          "ky_hieu": "Y_tt (%)",
          "cong_thuc": "Y_tt = [(Bx_non - Bx_mat_cai) / (100 - Bx_mat_cai)] * 100",
          "giai_thich": "Tỷ lệ khối lượng tinh thể đường kết tinh ra được so với tổng khối lượng khối đường non nấu thành công."
        },
        {
          "ten_chi_tieu": "Hiệu suất chuyển hóa đường thành tinh thể",
          "ky_hieu": "H_nau (%)",
          "cong_thuc": "H_nau = [Pol_non * (AP_non - AP_mat_cai)] / [AP_non * (100 - AP_mat_cai)] * 100",
          "giai_thich": "Hiệu suất kết tinh saccharose từ pha lỏng sang dạng tinh thể rắn trong nồi nấu."
        }
      ]
    },
    {
      "bai_so": 6,
      "ten_bai": "Ly tâm tách mật, sấy khô và tính toán hiệu suất thu hồi đường tổng thể",
      "mo_ta_thi_nghiem": "Đường non sau khi trải qua giai đoạn bồi tinh làm nguội để tinh thể kết tinh triệt để sẽ được đưa vào máy ly tâm lồng lưới có màng lọc mịn. Khi động cơ ly tâm quay ở vận tốc cao, lực ly tâm đẩy phần mật cái xuyên qua các khe lưới lọc ra ngoài, trong khi các tinh thể đường cát được giữ lại bám đều trên thành lồng quay. Tiến hành xối rửa nhẹ bề mặt lớp đường bằng tia nước nóng hoặc hơi nước sạch để cuốn trôi lớp màng mật bám quanh tinh thể, sau đó gạt đường ra khỏi thành lồng, sấy khô mẫu đường cát bằng tủ sấy hoặc luồng không khí nóng đến độ ẩm quy chuẩn ($W \\le 0.05\\%$). Cân toàn bộ khối lượng đường cát thu được, đo các chỉ tiêu chất lượng (Pol, độ ẩm, độ màu ICUMSA) và áp dụng công thức kinh điển Noël Deerr ($S-J-M$) để so sánh hiệu suất thu hồi thực tế với hiệu suất lý thuyết.",
      "thong_so_thuc_nghiem": [
        "Khối lượng khối đường non nạp vào ly tâm: m_non (kg)",
        "Khối lượng đường thành phẩm sau ly tâm và sấy: m_duong (kg)",
        "Độ Pol đường thành phẩm: S (%)",
        "Độ tinh khiết của mật chè ban đầu: J (%)",
        "Độ tinh khiết của mật rỉ (mật cuối): M (%)",
        "Độ ẩm đường thành phẩm: W_sp (%)"
      ],
      "cong_thuc_tinh_toan": [
        {
          "ten_chi_tieu": "Hiệu suất ly tâm tách đường",
          "ky_hieu": "H_lt (%)",
          "cong_thuc": "H_lt = (m_duong / m_non) * 100",
          "giai_thich": "Tỷ lệ khối lượng đường cát tinh thể thu được trên khối lượng đường non đem ly tâm."
        },
        {
          "ten_chi_tieu": "Hiệu suất thu hồi đường lý thuyết theo công thức S-J-M (Noël Deerr)",
          "ky_hieu": "H_SJM (%)",
          "cong_thuc": "H_SJM = [S * (J - M)] / [J * (S - M)] * 100",
          "giai_thich": "Hiệu suất thu hồi saccharose lý thuyết tối đa tính theo công thức Noël Deerr, trong đó S là độ tinh khiết (Pol) của đường thành phẩm, J là độ tinh khiết mật chè, M là độ tinh khiết của mật rỉ thải ra."
        },
        {
          "ten_chi_tieu": "Hiệu suất thu hồi toàn bộ quy trình sản xuất",
          "ky_hieu": "H_tong (%)",
          "cong_thuc": "H_tong = (H_ep / 100) * (H_ls / 100) * (H_cd / 100) * (H_lt / 100) * 100",
          "giai_thich": "Hiệu suất thu hồi đường thực tế tích hợp qua cả 4 công đoạn chính: Ép mía -> Làm sạch -> Cô đặc -> Ly tâm tách đường."
        }
      ]
    }
  ]
}