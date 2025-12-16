<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Rekomendasi Mata Kuliah</title>
    <style>
        .notification {
            padding: 10px;
            margin: 10px 0;
            border: 1px solid;
        }
        .notification.error {
            background-color: #ffebee;
            border-color: #f44336;
            color: #c62828;
        }
        .notification.success {
            background-color: #e8f5e9;
            border-color: #4caf50;
            color: #2e7d32;
        }
        .notification.info {
            background-color: #e3f2fd;
            border-color: #2196f3;
            color: #1565c0;
        }
        .loading {
            display: none;
            padding: 10px;
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
        }
        .progress-container {
            margin: 20px 0;
        }
        .progress-step {
            padding: 8px;
            margin: 5px 0;
            border-left: 3px solid #ccc;
            background: #f5f5f5;
        }
        .progress-step.active {
            border-left-color: #2196f3;
            background: #e3f2fd;
        }
        .progress-step.completed {
            border-left-color: #4caf50;
            background: #e8f5e9;
        }
        .progress-step.failed {
            border-left-color: #f44336;
            background: #ffebee;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-bar-fill {
            height: 100%;
            background: #4caf50;
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
    </style>
    <script>
        function showLoading(form) {
            document.getElementById('loading-box').style.display = 'block';
            form.querySelector('button[type="submit"]').disabled = true;
            return true;
        }
    </script>
</head>
<body>
    <h1>Sistem Rekomendasi Mata Kuliah</h1>
    
    <div style="padding: 10px; background: #f0f0f0; border: 1px solid #ccc; margin-bottom: 20px;">
        <strong>AI Provider:</strong> 
        <span style="margin-left: 10px;">Saat ini: <strong>{{ strtoupper(session('ai_provider', env('AI_PROVIDER', 'openrouter'))) }}</strong></span>
        <div style="margin-top: 10px;">
            <form method="POST" action="{{ route('switch.provider') }}" style="display: inline; margin-right: 10px;">
                @csrf
                <input type="hidden" name="provider" value="openrouter">
                <button type="submit" style="padding: 5px 15px;" {{ session('ai_provider', env('AI_PROVIDER', 'openrouter')) === 'openrouter' ? 'disabled' : '' }}>
                    OpenRouter
                </button>
            </form>
            <form method="POST" action="{{ route('switch.provider') }}" style="display: inline; margin-right: 10px;">
                @csrf
                <input type="hidden" name="provider" value="groq">
                <button type="submit" style="padding: 5px 15px;" {{ session('ai_provider', env('AI_PROVIDER', 'openrouter')) === 'groq' ? 'disabled' : '' }}>
                    GROQ
                </button>
            </form>
            <form method="POST" action="{{ route('switch.provider') }}" style="display: inline;">
                @csrf
                <input type="hidden" name="provider" value="deepseek">
                <button type="submit" style="padding: 5px 15px;" {{ session('ai_provider', env('AI_PROVIDER', 'openrouter')) === 'deepseek' ? 'disabled' : '' }}>
                    DeepSeek
                </button>
            </form>
        </div>
    </div>

    @if(session('error'))
        <div class="notification error">
            <strong>Error:</strong> {{ session('error') }}
            @if(session('error_detail'))
                <br><br>
                <details>
                    <summary>Detail Error</summary>
                    <pre>{{ session('error_detail') }}</pre>
                </details>
            @endif
        </div>
    @endif

    @if(session('success'))
        <div class="notification success">
            {{ session('success') }}
        </div>
    @endif

    @if(session('info'))
        <div class="notification info">
            {{ session('info') }}
        </div>
    @endif

    <form method="GET" action="/">
        <label for="user_id">Pilih Mahasiswa:</label>
        <select id="user_id" name="user_id" required onchange="this.form.submit()">
            @if(isset($users))
                @foreach($users as $user)
                    <option value="{{ $user['id'] }}" {{ (isset($selectedUser) && $selectedUser['id'] == $user['id']) ? 'selected' : '' }}>
                        {{ $user['nama'] }} (Semester {{ $user['semester_saat_ini'] }}) - NIM: {{ $user['nim'] }}
                    </option>
                @endforeach
            @else
                <option value="1">Mahasiswa 1 (Semester 3) - NIM: 13220001</option>
                <option value="2">Mahasiswa 2 (Semester 5) - NIM: 13220002</option>
                <option value="3">Mahasiswa 3 (Semester 7) - NIM: 13220003</option>
            @endif
        </select>
    </form>
        
    <br><br>
    
    @if(isset($selectedUser))
        <h3>Transkrip Nilai - {{ $selectedUser['nama'] }}</h3>
        @php
            $groupedTranscript = collect($selectedUser['transkrip'])->groupBy('semester');
        @endphp
        @foreach($groupedTranscript as $semester => $courses)
            <h4>Semester {{ $semester }}</h4>
            <table border="1" cellpadding="5">
                <tr>
                    <th>Kode MK</th>
                    <th>Nama Mata Kuliah</th>
                    <th>SKS</th>
                    <th>Nilai</th>
                </tr>
                @foreach($courses as $course)
                    <tr>
                        <td>{{ $course['kode_mk'] }}</td>
                        <td>{{ $course['nama_mk'] }}</td>
                        <td>{{ $course['sks'] }}</td>
                        <td>{{ $course['nilai'] }}</td>
                    </tr>
                @endforeach
            </table>
            <br>
        @endforeach
        
        <br>
        <form method="POST" action="{{ route('get.recommendation') }}" onsubmit="return showLoading(this)">
            @csrf
            <input type="hidden" name="user_id" value="{{ $selectedUser['id'] }}">
            
            <div id="loading-box" class="loading">
                <strong>Sedang memproses...</strong><br>
                <div id="status-log"></div>
            </div>
            
            <label>Peminatan:</label><br>
            <input type="checkbox" name="interests[]" value="Sistem Embedded"> Sistem Embedded<br>
            <input type="checkbox" name="interests[]" value="Internet of Things (IoT)"> Internet of Things (IoT)<br>
            <input type="checkbox" name="interests[]" value="Robotika"> Robotika<br>
            <input type="checkbox" name="interests[]" value="Machine Learning"> Machine Learning<br>
            <input type="checkbox" name="interests[]" value="Komunikasi Digital"> Komunikasi Digital<br>
            <input type="checkbox" name="interests[]" value="Sistem Tenaga"> Sistem Tenaga<br>
            <input type="checkbox" name="interests[]" value="Keamanan Siber"> Keamanan Siber<br>
            
            @error('interests')
                <p style="color: red;">{{ $message }}</p>
            @enderror
            
            <br><br>
            <button type="submit">Dapatkan Rekomendasi</button>
        </form>
    @endif

    @if(isset($results))
        <div>
            @if(isset($statusLogs) && count($statusLogs) > 0)
                <div class="notification success">
                    <strong>Status Proses</strong>
                    
                    @php
                        $maxStep = collect($statusLogs)->max('step') ?? 5;
                        $progress = ($maxStep / 5) * 100;
                    @endphp
                    
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: {{ $progress }}%">
                            {{ round($progress) }}%
                        </div>
                    </div>
                    
                    <div class="progress-container">
                        @php
                            $steps = [
                                1 => 'Membangun Prompt AI',
                                2 => 'Validasi API Key',
                                3 => 'Mengirim Request ke OpenRouter',
                                4 => 'Menerima Response dari AI',
                                5 => 'Memproses Hasil Rekomendasi'
                            ];
                            $completedSteps = collect($statusLogs)->pluck('step')->unique()->toArray();
                        @endphp
                        
                        @foreach($steps as $stepNum => $stepName)
                            @php
                                $stepLogs = collect($statusLogs)->where('step', $stepNum);
                                $hasError = $stepLogs->contains(function($log) {
                                    return str_contains(strtolower($log['message']), 'error');
                                });
                                $isCompleted = in_array($stepNum, $completedSteps);
                                $class = $hasError ? 'failed' : ($isCompleted ? 'completed' : '');
                            @endphp
                            
                            <div class="progress-step {{ $class }}">
                                <strong>{{ $stepName }}</strong>
                                @if($stepLogs->isNotEmpty())
                                    <div style="margin-left: 10px; font-size: 0.9em;">
                                        @foreach($stepLogs as $log)
                                            <div>[{{ $log['time'] }}] [{{ $log['elapsed'] }}ms] {{ $log['message'] }}</div>
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
            
            @if(isset($studentInfo))
                <div>
                    <h3>Informasi Mahasiswa</h3>
                    <p><strong>Nama:</strong> {{ $studentInfo['nama'] }}</p>
                    <p><strong>NIM:</strong> {{ $studentInfo['nim'] }}</p>
                    <p><strong>Semester:</strong> {{ $studentInfo['semester'] }}</p>
                </div>
            @endif
            
            <h2>Hasil Rekomendasi</h2>
            
            <h3>Ringkasan Analisis</h3>
            <p>{{ $results['ringkasan_analisis'] }}</p>
            
            <h3>Daftar Rekomendasi</h3>
            @forelse($results['daftar_rekomendasi'] as $rec)
                <div>
                    <strong>Skor: {{ $rec['skor_rekomendasi'] }} / 10</strong>
                    <h4>{{ $rec['kode_mk'] }} - {{ $rec['nama_mk'] }} ({{ $rec['tipe'] }})</h4>
                    <p><strong>Alasan:</strong> {{ $rec['alasan_rekomendasi'] }}</p>
                    <hr>
                </div>
            @empty
                <p>Tidak ada rekomendasi yang ditemukan.</p>
            @endforelse
        </div>
    @endif
</body>
</html>
